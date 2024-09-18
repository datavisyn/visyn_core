import { useSetState } from '@mantine/hooks';
import { type ScaleOrdinal } from 'd3v7';
import { EChartsOption } from 'echarts';
import type { BarSeriesOption } from 'echarts/charts';
import round from 'lodash/round';
import uniq from 'lodash/uniq';
import * as React from 'react';
import { NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { useChart } from '../vishooks/hooks/useChart';
import { AXIS_LABEL_MAX_LENGTH, BAR_SPACING, BAR_WIDTH, CHART_HEIGHT_MARGIN, VERTICAL_BAR_CHART_HEIGHT } from './constants';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState, IBarConfig, IBarDataTableRow } from './interfaces';

function median(arr: number[]) {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b) as number[];
  const medianVal = arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1]! + nums[mid]!) / 2;
  return medianVal;
}

/**
 * Calculates and returns the rounded absolute or normalized value, dependending on the config value.
 * Enabled grouping always returns the absolute value. The normalized value is only calculated for stacked bars.
 * @param config Bar chart configuration
 * @param value Absolute value
 * @param total Number of values in the category
 * @returns Returns the rounded absolute value. Otherwise returns the rounded normalized value.
 */
function normalizedValue({ config, value, total }: { config: IBarConfig; value: number; total: number }) {
  // NOTE: @dv-usama-ansari: Filter out Infinity and -Infinity values. This is required for proper display of minimum and maximum aggregations.
  if ([Infinity, -Infinity].includes(value)) {
    return null;
  }
  return config?.group && config?.groupType === EBarGroupingType.STACK && config?.display === EBarDisplayType.NORMALIZED
    ? round((value / total) * 100, 2)
    : round(value, 4);
}

/**
 * Sorts the series data based on the specified order.
 *
 * For input data like below:
 * ```ts
 * const series = [{
 *   categories: ["Unknown", "High", "Moderate", "Low"],
 *   data: [26, 484, 389, 111],
 * },{
 *   categories: ["Unknown", "High", "Moderate", "Low"],
 *   data: [22, 344, 239, 69],
 * },{
 *   categories: ["Unknown", "High", "Moderate", "Low"],
 *   data: [6, 111, 83, 20],
 * }];
 * ```
 *
 * This function would return an output like below:
 * ```ts
 * const sortedSeries = [{ // The total of `Moderate` is the highest, sorted in descending order and `Unknown` is placed last no matter what.
 *   categories: ["Moderate", "Low", "High", "Unknown"],
 *   data: [111, 20, 83, 6],
 * },{
 *   categories: ["Moderate", "Low", "High", "Unknown"],
 *   data: [239, 69, 344, 22],
 * },{
 *   categories: ["Moderate", "Low", "High", "Unknown"],
 *   data: [389, 484, 111, 26],
 * }]
 * ```
 *
 * This function uses `for` loop for maximum performance and readability.
 *
 * @param series
 * @param sortOrder
 * @returns
 */
function sortSeries(
  series: { categories: string[]; data: BarSeriesOption['data'] }[],
  sortOrder: EBarSortState = EBarSortState.NONE,
): { categories: string[]; data: BarSeriesOption['data'] }[] {
  // Step 1: Aggregate the data
  const aggregatedData: { [key: string]: number } = {};
  let unknownCategorySum = 0;
  for (const s of series) {
    for (let i = 0; i < s.categories.length; i++) {
      const category = s.categories[i] as string;
      const value = (s.data?.[i] as number) || 0;
      if (category === 'Unknown') {
        unknownCategorySum += value;
      } else {
        if (!aggregatedData[category]) {
          aggregatedData[category] = 0;
        }
        aggregatedData[category] += value;
      }
    }
  }

  // Add the 'Unknown' category at the end
  aggregatedData[NAN_REPLACEMENT] = unknownCategorySum;

  // NOTE: @dv-usama-ansari: filter out keys with 0 values
  for (const key in aggregatedData) {
    if (aggregatedData[key] === 0) {
      delete aggregatedData[key];
    }
  }

  // Step 2: Sort the aggregated data
  const sortedCategories = Object.keys(aggregatedData).sort((a, b) => {
    if (a === NAN_REPLACEMENT) {
      return 1;
    }
    if (b === NAN_REPLACEMENT) {
      return -1;
    }
    return sortOrder === EBarSortState.ASCENDING
      ? (aggregatedData[a] as number) - (aggregatedData[b] as number)
      : sortOrder === EBarSortState.DESCENDING
        ? (aggregatedData[b] as number) - (aggregatedData[a] as number)
        : 0;
  });

  // Create a mapping of categories to their sorted indices
  const categoryIndexMap: { [key: string]: number } = {};
  for (let i = 0; i < sortedCategories.length; i++) {
    categoryIndexMap[sortedCategories[i] as string] = i;
  }

  // Step 3: Sort each series according to the sorted categories
  const sortedSeries: typeof series = [];
  for (const s of series) {
    const sortedData = new Array(sortedCategories.length).fill(null);
    for (let i = 0; i < s.categories.length; i++) {
      // NOTE: @dv-usama-ansari: index of the category in the sorted array
      sortedData[categoryIndexMap[s.categories?.[i] as string] as number] = s.data?.[i];
    }
    sortedSeries.push({
      ...s,
      categories: sortedCategories,
      data: sortedData,
    });
  }

  return sortedSeries;
}

function EagerSingleEChartsBarChart({
  config,
  setConfig,
  selectedList,
  selectedMap,
  selectionCallback,
  dataTable,
  selectedFacetValue,
  selectedFacetIndex,
  groupColorScale,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedMap' | 'selectedList'> & {
  dataTable: IBarDataTableRow[];
  selectedFacetValue?: string;
  selectedFacetIndex?: number;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
  groupColorScale: ScaleOrdinal<string, string, never>;
}) {
  const [visState, setVisState] = useSetState({
    series: [] as BarSeriesOption[],
    xAxis: null as EChartsOption['xAxis'] | null,
    yAxis: null as EChartsOption['yAxis'] | null,
  });

  const filteredDataTable = React.useMemo(
    () => (selectedFacetValue ? dataTable.filter((item) => item.facet === selectedFacetValue) : dataTable),
    [dataTable, selectedFacetValue],
  );

  const aggregatedData = React.useMemo(() => {
    const values: {
      [category: string]: {
        total: number;
        ids: string[];
        selected: { count: number; sum: number; ids: string[] };
        unselected: { count: number; sum: number; ids: string[] };
        groupings: {
          [grouping: string]: {
            selected: { count: number; sum: number; min: number; max: number; nums: number[]; ids: string[] };
            unselected: { count: number; sum: number; min: number; max: number; nums: number[]; ids: string[] };
          };
        };
      };
    } = {};
    const minMax: {
      [category: string]: {
        groupings: {
          [grouping: string]: {
            selected: { min: number; max: number };
            unselected: { min: number; max: number };
          };
        };
      };
    } = {};
    filteredDataTable.forEach((item) => {
      const { category, agg, group: grouping } = item;
      const selected = selectedMap?.[item.id] || false;
      if (!values[category]) {
        values[category] = { total: 0, ids: [], selected: { count: 0, sum: 0, ids: [] }, unselected: { count: 0, sum: 0, ids: [] }, groupings: {} };
      }
      if (!values[category].groupings[grouping]) {
        values[category].groupings[grouping] = {
          selected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
          unselected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
        };
      }
      if (!minMax[category]) {
        minMax[category] = { groupings: {} };
      }
      if (!minMax[category].groupings[grouping]) {
        minMax[category].groupings[grouping] = {
          selected: { min: Infinity, max: -Infinity },
          unselected: { min: Infinity, max: -Infinity },
        };
      }

      // update category values
      if (selected) {
        values[category].selected.count++;
        values[category].selected.sum += agg;
        values[category].selected.ids.push(item.id);
      } else {
        values[category].unselected.count++;
        values[category].unselected.sum += agg;
        values[category].unselected.ids.push(item.id);
      }
      values[category].total++;
      values[category].ids.push(item.id);

      // update group values
      if (selected) {
        values[category].groupings[grouping].selected.count++;
        values[category].groupings[grouping].selected.sum += agg;
        values[category].groupings[grouping].selected.nums.push(agg);
        values[category].groupings[grouping].selected.ids.push(item.id);
        minMax[category].groupings[grouping].selected.min = Math.min(minMax[category].groupings[grouping].selected.min, agg || Infinity);
        minMax[category].groupings[grouping].selected.max = Math.max(minMax[category].groupings[grouping].selected.max, agg || -Infinity);
      } else {
        values[category].groupings[grouping].unselected.count++;
        values[category].groupings[grouping].unselected.sum += agg;
        values[category].groupings[grouping].unselected.nums.push(agg);
        values[category].groupings[grouping].unselected.ids.push(item.id);
        minMax[category].groupings[grouping].unselected.min = Math.min(minMax[category].groupings[grouping].unselected.min, agg || Infinity);
        minMax[category].groupings[grouping].unselected.max = Math.max(minMax[category].groupings[grouping].unselected.max, agg || -Infinity);
      }
    });
    filteredDataTable.forEach((item) => {
      const { category, group: grouping } = item;
      if (values?.[category]?.groupings[grouping] && minMax?.[category]?.groupings[grouping]) {
        values[category].groupings[grouping].selected.min = minMax[category].groupings[grouping].selected.min;
        values[category].groupings[grouping].selected.max = minMax[category].groupings[grouping].selected.max;
        values[category].groupings[grouping].unselected.min = minMax[category].groupings[grouping].unselected.min;
        values[category].groupings[grouping].unselected.max = minMax[category].groupings[grouping].unselected.max;
      }
    });
    return values;
  }, [filteredDataTable, selectedMap]);

  const categories = React.useMemo(() => uniq(filteredDataTable.map((item) => item.category)), [filteredDataTable]);
  const groupings = React.useMemo(() => uniq(filteredDataTable.map((item) => item.group)), [filteredDataTable]);
  const hasSelected = React.useMemo(() => (selectedMap ? Object.values(selectedMap).some((selected) => selected) : false), [selectedMap]);

  const chartHeight = React.useMemo(() => {
    // NOTE: @dv-usama-ansari: Using memoized `categories` and `groupings` saves a lot of computation time as compared to using the `calculateChartHeight` function (where recalculates the categories and groupings over many data points).
    if (config?.direction === EBarDirection.VERTICAL) {
      // use fixed height for vertical bars
      return VERTICAL_BAR_CHART_HEIGHT;
    }
    if (config?.direction === EBarDirection.HORIZONTAL) {
      // calculate height for horizontal bars
      const categoryWidth =
        config?.group && config?.groupType === EBarGroupingType.STACK ? BAR_WIDTH + BAR_SPACING : (BAR_WIDTH + BAR_SPACING) * groupings.length; // TODO: Make dynamic group length based on series data filtered for null
      return categories.length * categoryWidth + 2 * BAR_SPACING; // NOTE: @dv-usama-ansari: 20 = 10 padding top + 10 padding bottom
    }
    return 0;
  }, [categories.length, config?.direction, config?.group, config?.groupType, groupings.length]);

  const getDataForAggregationType = React.useCallback(
    (group: string, selected: 'selected' | 'unselected') => {
      switch (config?.aggregateType) {
        case EAggregateTypes.COUNT:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.groupings[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[category].groupings[group][selected].count, total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.AVG:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.groupings[group]?.[selected]
              ? normalizedValue({
                  config,
                  value: aggregatedData[category].groupings[group][selected].sum / aggregatedData[category].groupings[group][selected].count,
                  total: aggregatedData[category].total,
                })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MIN:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.groupings[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[category].groupings[group][selected].min, total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MAX:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.groupings[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[category].groupings[group][selected].max, total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MED:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.groupings[group]?.[selected]
              ? normalizedValue({
                  config,
                  value: median(aggregatedData[category].groupings[group][selected].nums) as number,
                  total: aggregatedData[category].total,
                })
              : 0,
            category: categories[index],
          }));

        default:
          console.warn(`Aggregation type ${config?.aggregateType} is not supported by bar chart.`);
          return [];
      }
    },
    [aggregatedData, categories, config],
  );

  // prepare data
  const barSeriesBase = React.useMemo(
    () =>
      ({
        type: 'bar',
        blur: { label: { show: false } },
        barMaxWidth: BAR_WIDTH,

        label: {
          show: true,
          formatter: (params) =>
            // grouping always uses the absolute value
            config?.group && config?.groupType === EBarGroupingType.STACK && config?.display === EBarDisplayType.NORMALIZED
              ? `${params.value}%`
              : String(params.value),
        },

        labelLayout: {
          hideOverlap: true,
        },

        sampling: 'average',
        large: filteredDataTable.length > 1000,

        // enable click events on bars -> handled by chartInstance callback
        triggerEvent: true,

        clip: false,
        catColumnSelected: config?.catColumnSelected,
        group: config?.group,
      }) as BarSeriesOption,
    [config?.catColumnSelected, config?.display, config?.group, config?.groupType, filteredDataTable.length],
  );

  const optionBase = React.useMemo(
    () =>
      ({
        height: `${chartHeight}px`,
        animation: false,

        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow',
          },
          backgroundColor: 'var(--tooltip-bg,var(--mantine-color-gray-9))',
          borderWidth: 0,
          borderColor: 'transparent',
          textStyle: {
            color: 'var(--tooltip-color,var(--mantine-color-white))',
          },
        },

        title: [
          {
            text: selectedFacetValue || null,
            triggerEvent: true,
            name: 'facetTitle',
          },
        ],

        grid: {
          containLabel: true,
        },

        legend: {
          orient: 'horizontal',
          top: 30,
          type: 'scroll',
          icon: 'circle',
        },
      }) as EChartsOption,
    [chartHeight, selectedFacetValue],
  );

  const updateSortSideEffect = React.useCallback(
    ({ barSeries = [] }: { barSeries: (BarSeriesOption & { categories: string[] })[] }) => {
      if (barSeries.length > 0) {
        if (config?.direction === EBarDirection.HORIZONTAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            config?.sortState?.x,
          );
          // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
          setVisState((v) => ({
            ...v,
            series: barSeries.map((item, itemIndex) => ({ ...item, data: [...sortedSeries[itemIndex]!.data!].reverse() })),
            yAxis: { ...v.yAxis, type: 'category' as const, data: [...(sortedSeries[0]?.categories as string[])].reverse() },
          }));
        }
        if (config?.direction === EBarDirection.VERTICAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            config?.sortState?.y,
          );

          setVisState((v) => ({
            ...v,
            series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]!.data })),
            xAxis: { ...v.xAxis, type: 'category' as const, data: sortedSeries[0]?.categories },
          }));
        }
      }
    },
    [config?.direction, config?.sortState?.x, config?.sortState?.y, setVisState],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    if (config?.direction === EBarDirection.HORIZONTAL) {
      setVisState((v) => ({
        ...v,
        xAxis: {
          type: 'value' as const,
          name: config?.aggregateType,
          nameLocation: 'middle',
          nameTextStyle: { padding: [20, 0, 0, 0] },
          ...(config.xAxisDomain ? { min: config.xAxisDomain[0], max: config.xAxisDomain[1] } : {}),
        },
        yAxis: {
          ...v.yAxis,
          type: 'category' as const,
          name: config?.catColumnSelected?.name,
          nameLocation: 'middle',
          nameTextStyle: {
            padding: [0, 0, 100, 0],
          },
          axisLabel: {
            show: true,
            formatter: (value: string) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            // TODO: add tooltip for truncated labels (@see https://github.com/apache/echarts/issues/19616 and workaround https://codepen.io/plainheart/pen/jOGBrmJ)
          },
        },
      }));
    }
    if (config?.direction === EBarDirection.VERTICAL) {
      setVisState((v) => ({
        ...v,
        xAxis: {
          ...v.xAxis,
          type: 'category' as const,
          name: config?.catColumnSelected?.name,
          nameLocation: 'middle',
          nameTextStyle: {
            padding: [64, 0, 0, 0],
          },
          axisLabel: {
            show: true,
            formatter: (value: string) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            rotate: 45,
          },
        },
        yAxis: {
          type: 'value' as const,
          name: config?.aggregateType,
          nameLocation: 'middle',
          nameTextStyle: { padding: [0, 0, 40, 0] },
          ...(config.yAxisDomain ? { min: config.yAxisDomain[0], max: config.yAxisDomain[1] } : {}),
        },
      }));
    }
  }, [config?.aggregateType, config?.catColumnSelected?.name, config?.direction, config?.xAxisDomain, config?.yAxisDomain, setVisState]);

  const updateCategoriesSideEffect = React.useCallback(() => {
    const barSeries = groupings
      .map((group) => {
        return (['selected', 'unselected'] as const).map((items) => {
          const data = getDataForAggregationType(group, items);

          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => [Infinity, -Infinity].includes(d.value as number) || Number.isNaN(d.value))) {
            return null;
          }
          const isGrouped = config?.group && groupColorScale != null;
          const isSelectedCase = items === 'selected';
          const lowerBarOpacity = hasSelected && isGrouped && isSelectedCase ? { opacity: VIS_UNSELECTED_OPACITY } : {};
          const lowerLabelOpacity = hasSelected && isGrouped && !isSelectedCase ? { opacity: 0.8 } : {};
          return {
            ...barSeriesBase,
            name: groupings.length > 1 ? group : null,
            label: {
              show: true,
              ...lowerLabelOpacity,
            },
            itemStyle: {
              color:
                group === NAN_REPLACEMENT
                  ? isSelectedCase
                    ? SELECT_COLOR
                    : VIS_NEUTRAL_COLOR
                  : isGrouped
                    ? groupColorScale(group) || VIS_NEUTRAL_COLOR
                    : VIS_NEUTRAL_COLOR,

              ...lowerBarOpacity,
            },
            data: data.map((d) => (d.value === 0 ? null : d.value)) as number[],

            categories: data.map((d) => d.category),

            // group = individual group names, stack = any fixed name
            stack: config?.groupType === EBarGroupingType.STACK ? 'total' : group,
          };
        });
      })
      .flat()
      .filter(Boolean) as (BarSeriesOption & { categories: string[] })[];

    updateSortSideEffect({ barSeries });
    updateDirectionSideEffect();
  }, [
    barSeriesBase,
    config?.group,
    config?.groupType,
    getDataForAggregationType,
    groupColorScale,
    groupings,
    hasSelected,
    updateDirectionSideEffect,
    updateSortSideEffect,
  ]);

  const options = React.useMemo(() => {
    return {
      ...optionBase,
      ...(visState.series ? { series: visState.series } : {}),
      ...(visState.xAxis ? { xAxis: visState.xAxis } : {}),
      ...(visState.yAxis ? { yAxis: visState.yAxis } : {}),
    } as EChartsOption;
  }, [visState.xAxis, visState.yAxis, optionBase, visState.series]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the direction of the bar chart changes.
  React.useEffect(() => {
    updateDirectionSideEffect();
  }, [config?.direction, updateDirectionSideEffect]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the selected categorical column changes.
  React.useEffect(() => {
    updateCategoriesSideEffect();
  }, [updateCategoriesSideEffect]);

  const settings = React.useMemo(
    () => ({
      notMerge: true,
    }),
    [],
  );

  const { setRef } = useChart({
    options,
    settings,
    mouseEvents: {
      click: [
        {
          query: { titleIndex: 0 },
          handler: (params) => {
            setConfig?.({ ...config!, focusFacetIndex: config?.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
          },
        },
        {
          query: { seriesType: 'bar' },
          handler: (params) => {
            const event = params.event?.event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>;
            const ids = filteredDataTable
              .filter((item) => {
                if (config?.group) {
                  if (config.group.id === config?.facets?.id) {
                    return item.facet === selectedFacetValue && item.category === params.name;
                  }
                  return item.group === params.seriesName && item.category === params.name;
                }
                return item.category === params.name;
              })
              .map((item) => item.id);

            if (event.shiftKey) {
              // NOTE: @dv-usama-ansari: `shift + click` on a bar which is already selected will deselect it.
              //  Using `Set` to reduce time complexity to O(1).
              const newSelectedSet = new Set(selectedList);
              ids.forEach((id) => {
                if (newSelectedSet.has(id)) {
                  newSelectedSet.delete(id);
                } else {
                  newSelectedSet.add(id);
                }
              });
              const newSelectedList = [...newSelectedSet];
              selectionCallback(event, [...new Set([...newSelectedList])]);
            } else {
              selectionCallback(event, ids);
            }
          },
        },
      ],
    },
  });

  return options ? <div ref={setRef} style={{ width: '100%', height: `${chartHeight + CHART_HEIGHT_MARGIN}px` }} /> : null;
}

export const SingleEChartsBarChart = React.memo(EagerSingleEChartsBarChart);
