import { type ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';
import { useSetState } from '@mantine/hooks';
import round from 'lodash/round';
import uniq from 'lodash/uniq';
import * as React from 'react';
import { EChartsOption } from 'echarts';
import { NAN_REPLACEMENT, VIS_NEUTRAL_COLOR } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState, IBarConfig, IBarDataTableRow } from './interfaces';
import { useChart } from '../vishooks/hooks/useChart';

/**
 * Width of a single bar
 */
const BAR_WIDTH = 25;

/**
 * Spacing between bars in a category
 */
const BAR_SPACING = 10;

/**
 * Height margin for the chart to avoid cutting off bars, legend, title, axis labels, etc.
 */
const CHART_HEIGHT_MARGIN = 100;

/**
 * Maximum character length of axis labels before truncation
 */
const AXIS_LABEL_MAX_LENGTH = 10;

function median(arr: number[]) {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  const medianVal = arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
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
  return config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
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
  // if (sortOrder === EBarSortState.NONE) {
  //   return series;
  // }

  // Step 1: Aggregate the data
  const aggregatedData: { [key: string]: number } = {};
  let unknownCategorySum = 0;
  for (const s of series) {
    for (let i = 0; i < s.categories.length; i++) {
      const category = s.categories[i];
      const value = (s.data[i] as number) || 0;
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
  aggregatedData.Unknown = unknownCategorySum;

  // NOTE: @dv-usama-ansari: filter out keys with 0 values
  for (const key in aggregatedData) {
    if (aggregatedData[key] === 0) {
      delete aggregatedData[key];
    }
  }

  // Step 2: Sort the aggregated data
  const sortedCategories = Object.keys(aggregatedData).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return sortOrder === EBarSortState.ASCENDING
      ? aggregatedData[a] - aggregatedData[b]
      : sortOrder === EBarSortState.DESCENDING
        ? aggregatedData[b] - aggregatedData[a]
        : 0;
  });

  // Create a mapping of categories to their sorted indices
  const categoryIndexMap: { [key: string]: number } = {};
  for (let i = 0; i < sortedCategories.length; i++) {
    categoryIndexMap[sortedCategories[i]] = i;
  }

  // Step 3: Sort each series according to the sorted categories
  const sortedSeries: typeof series = [];
  for (const s of series) {
    const sortedData = new Array(sortedCategories.length).fill(null);
    for (let i = 0; i < s.categories.length; i++) {
      // NOTE: @dv-usama-ansari: index of the category in the sorted array
      sortedData[categoryIndexMap[s.categories[i]]] = s.data[i];
    }
    sortedSeries.push({
      ...s,
      categories: sortedCategories,
      data: sortedData,
    });
  }

  return sortedSeries;
}

const VERTICAL_BAR_CHART_HEIGHT = 250;

export const calculateChartHeight = (config: IBarConfig, dataTable: IBarDataTableRow[], facetValue: string) => {
  const categories = new Set();
  const groupings = new Set();
  dataTable
    .filter((i) => i.facet === facetValue)
    .forEach((item) => {
      categories.add(item.category);
      groupings.add(item.group);
    });

  if (config.direction === EBarDirection.VERTICAL) {
    // use fixed height for vertical bars
    return VERTICAL_BAR_CHART_HEIGHT + CHART_HEIGHT_MARGIN;
  }
  if (config.direction === EBarDirection.HORIZONTAL) {
    // calculate height for horizontal bars
    const categoryWidth = config.group && config.groupType === EBarGroupingType.STACK ? BAR_WIDTH + BAR_SPACING : (BAR_WIDTH + BAR_SPACING) * groupings.size; // TODO: Make dynamic group length based on series data filtered for null
    return categories.size * categoryWidth + 2 * BAR_SPACING + CHART_HEIGHT_MARGIN;
  }
  return 0;
};

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
  /* const [series, setSeries] = React.useState<BarSeriesOption[]>([]);
  const [axes, setAxes] = React.useState<{ xAxis: ReactEChartsProps['option']['xAxis']; yAxis: EChartsOption['yAxis'] }>({
    xAxis: null,
    yAxis: null,
  }); */

  const [visState, setVisState] = useSetState({
    series: [] as BarSeriesOption[],
    xAxis: null as EChartsOption['xAxis'],
    yAxis: null as EChartsOption['yAxis'],
  });

  const filteredDataTable = React.useMemo(
    () => (selectedFacetValue ? dataTable.filter((item) => item.facet === selectedFacetValue) : dataTable),
    [dataTable, selectedFacetValue],
  );

  const aggregatedData = React.useMemo(() => {
    const values = {};
    filteredDataTable.forEach((item) => {
      const { category, agg, group: grouping } = item;
      const selected = selectedMap?.[item.id] || false;
      if (!values[category]) {
        values[category] = { total: 0, ids: [], selected: { count: 0, sum: 0, ids: [] }, unselected: { count: 0, sum: 0, ids: [] } };
      }
      if (!values[category][grouping]) {
        values[category][grouping] = {
          selected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
          unselected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
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
        values[category][grouping].selected.count++;
        values[category][grouping].selected.sum += agg;
        values[category][grouping].selected.min = Math.min(values[category][grouping].selected.min, agg);
        values[category][grouping].selected.max = Math.max(values[category][grouping].selected.max, agg);
        values[category][grouping].selected.nums.push(agg);
        values[category][grouping].selected.ids.push(item.id);
      } else {
        values[category][grouping].unselected.count++;
        values[category][grouping].unselected.sum += agg;
        values[category][grouping].unselected.min = Math.min(values[category][grouping].unselected.min, agg);
        values[category][grouping].unselected.max = Math.max(values[category][grouping].unselected.max, agg);
        values[category][grouping].unselected.nums.push(agg);
        values[category][grouping].unselected.ids.push(item.id);
      }
    });
    return values;
  }, [filteredDataTable, selectedMap]);

  const categories = React.useMemo(() => uniq(filteredDataTable.map((item) => item.category)), [filteredDataTable]);
  const groupings = React.useMemo(() => uniq(filteredDataTable.map((item) => item.group)), [filteredDataTable]);
  const hasSelected = React.useMemo(() => (selectedMap ? Object.values(selectedMap).some((selected) => selected) : false), [selectedMap]);

  const calculateChartHeight = React.useMemo(() => {
    if (config.direction === EBarDirection.VERTICAL) {
      // use fixed height for vertical bars
      return VERTICAL_BAR_CHART_HEIGHT;
    }
    if (config.direction === EBarDirection.HORIZONTAL) {
      // calculate height for horizontal bars
      const categoryWidth =
        config.group && config.groupType === EBarGroupingType.STACK ? BAR_WIDTH + BAR_SPACING : (BAR_WIDTH + BAR_SPACING) * groupings.length; // TODO: Make dynamic group length based on series data filtered for null
      return categories.length * categoryWidth + 2 * BAR_SPACING; // NOTE: @dv-usama-ansari: 20 = 10 padding top + 10 padding bottom
    }
    return 0;
  }, [categories.length, config.direction, config.group, config.groupType, groupings.length]);

  // console.log('calculateChartHeight', calculateChartHeight);

  const getDataForAggregationType = React.useCallback(
    (group: string, selected: 'selected' | 'unselected') => {
      switch (config.aggregateType) {
        case EAggregateTypes.COUNT:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[category][group][selected].count, total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.AVG:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.[group]?.[selected]
              ? normalizedValue({
                  config,
                  value: aggregatedData[category][group][selected].sum / aggregatedData[category][group][selected].count,
                  total: aggregatedData[category].total,
                })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MIN:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[category][group][selected].min, total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MAX:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[category][group][selected].max, total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MED:
          return categories.map((category, index) => ({
            value: aggregatedData[category]?.[group]?.[selected]
              ? normalizedValue({ config, value: median(aggregatedData[category][group][selected].nums), total: aggregatedData[category].total })
              : 0,
            category: categories[index],
          }));

        default:
          console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
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
        emphasis: { focus: 'series', blurScope: 'coordinateSystem', label: { show: true } },
        blur: { label: { show: false } },
        barMaxWidth: BAR_WIDTH,

        label: {
          show: true,
          formatter: (params) =>
            // grouping always uses the absolute value
            config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
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

        catColumnSelected: config.catColumnSelected,
        group: config.group,
      }) as BarSeriesOption,
    [config.catColumnSelected, config.display, config.group, config.groupType, filteredDataTable.length],
  );

  const optionBase = React.useMemo(
    () =>
      ({
        height: `${calculateChartHeight}px`,
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
    [calculateChartHeight, selectedFacetValue],
  );

  const updateSortSideEffect = React.useCallback(
    ({ barSeries = [] }: { barSeries: (BarSeriesOption & { categories: string[] })[] }) => {
      if (config.direction === EBarDirection.HORIZONTAL) {
        const sortedSeries = sortSeries(
          barSeries.map((item) => ({ categories: item.categories, data: item.data })),
          config.sortState.x,
        );
        // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
        setVisState({
          series: barSeries.map((item, itemIndex) => ({ ...item, data: [...sortedSeries[itemIndex].data].reverse() })),
          yAxis: { ...visState.yAxis, data: [...sortedSeries[0].categories].reverse() },
        });
        // setSeries(barSeries.map((item, itemIndex) => ({ ...item, data: [...sortedSeries[itemIndex].data].reverse() })));
        // setAxes((a) => ({ ...a, yAxis: { ...a.yAxis, data: [...sortedSeries[0].categories].reverse() } }));
      }
      if (config.direction === EBarDirection.VERTICAL) {
        const sortedSeries = sortSeries(
          barSeries.map((item) => ({ categories: item.categories, data: item.data })),
          config.sortState.y,
        );

        setVisState({
          series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex].data })),
          xAxis: { ...visState.xAxis, data: sortedSeries[0].categories },
        });
        // setSeries(barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex].data })));
        // setAxes((a) => ({ ...a, xAxis: { ...a.xAxis, data: sortedSeries[0].categories } }));
      }
    },
    [config.direction, config.sortState.x, config.sortState.y, setVisState, visState.xAxis, visState.yAxis],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    if (config.direction === EBarDirection.HORIZONTAL) {
      setVisState((a) => ({
        xAxis: { type: 'value' as const },
        yAxis: {
          ...a.yAxis,
          type: 'category' as const,
          axisLabel: {
            show: true,
            formatter: (value) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            // TODO: add tooltip for truncated labels (@see
          },
        },
      }));
    }
    if (config.direction === EBarDirection.VERTICAL) {
      setVisState((a) => ({
        xAxis: {
          ...a.xAxis,
          type: 'category' as const,
          axisLabel: {
            show: true,
            formatter: (value) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            rotate: 45,
          },
        },
        yAxis: { type: 'value' as const },
      }));
    }
  }, [config.direction, setVisState]);

  const updateCategoriesSideEffect = React.useCallback(() => {
    const barSeries = groupings
      .map((group) => {
        return (['selected', 'unselected'] as const).map((selected) => {
          const data = getDataForAggregationType(group, selected);

          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => d.value === 0 || Number.isNaN(d.value))) {
            return null;
          }

          return {
            ...barSeriesBase,
            name: groupings.length > 1 ? group : null,
            itemStyle: {
              color:
                group === NAN_REPLACEMENT
                  ? VIS_NEUTRAL_COLOR
                  : config.group && groupColorScale
                    ? groupColorScale(group) || VIS_NEUTRAL_COLOR
                    : VIS_NEUTRAL_COLOR,
              // reduce opacity for unselected bars if there are selected items
              opacity: hasSelected ? (selected === 'selected' ? 1 : 0.5) : 1,
            },
            data: data.map((d) => (d.value === 0 ? null : d.value)) as number[],
            categories: data.map((d) => d.category),

            // group = individual group names, stack = any fixed name
            stack: config.groupType === EBarGroupingType.STACK ? 'total' : group,
          } as BarSeriesOption & { categories: string[] };
        });
      })
      .flat()
      .filter(Boolean);

    updateSortSideEffect({ barSeries });
    updateDirectionSideEffect();
  }, [
    barSeriesBase,
    config.group,
    config.groupType,
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
  }, [config.direction, updateDirectionSideEffect]);

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
            setConfig({ ...config, focusFacetIndex: config.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
          },
        },
        {
          query: { seriesType: 'bar' },
          handler: (params) => {
            const event = params.event.event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>;
            const ids = filteredDataTable
              .filter((item) => item.category === params.name && (!config.group || (config.group && item.group === params.seriesName)))
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

  return options ? <div ref={setRef} style={{ width: '100%', height: `${calculateChartHeight + CHART_HEIGHT_MARGIN}px` }} /> : null;
}

export const SingleEChartsBarChart = React.memo(EagerSingleEChartsBarChart);
