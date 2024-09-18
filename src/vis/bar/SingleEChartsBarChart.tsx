import { useSetState } from '@mantine/hooks';
import { type ScaleOrdinal } from 'd3v7';
import { EChartsOption } from 'echarts';
import type { BarSeriesOption } from 'echarts/charts';
import round from 'lodash/round';
import * as React from 'react';
import { DEFAULT_COLOR, NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { useChart } from '../vishooks/hooks/useChart';
import { BAR_WIDTH, CHART_HEIGHT_MARGIN } from './constants';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState, IBarConfig } from './interfaces';

// TODO: @dv-usama-ansari: Move this into utils
export function median(arr: number[]) {
  if (arr.length === 0) {
    return null;
  }
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

export type AggregatedDataType = {
  categoriesList: string[];
  groupingsList: string[];
  categories: {
    [category: string]: {
      total: number;
      ids: string[];
      groups: {
        [group: string]: {
          total: number;
          ids: string[];
          selected: { count: number; sum: number; min: number; max: number; nums: number[]; ids: string[] };
          unselected: { count: number; sum: number; min: number; max: number; nums: number[]; ids: string[] };
        };
      };
    };
  };
};

function EagerSingleEChartsBarChart({
  aggregatedData,
  chartHeight,
  config,
  globalMax,
  globalMin,
  groupColorScale,
  selectedFacetIndex,
  selectedFacetValue,
  selectedList,
  selectedMap,
  selectionCallback,
  setConfig,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedMap' | 'selectedList'> & {
  aggregatedData: AggregatedDataType;
  chartHeight: number;
  globalMax: number;
  globalMin: number;
  groupColorScale: ScaleOrdinal<string, string, never>;
  selectedFacetIndex?: number;
  selectedFacetValue?: string;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
}) {
  const [visState, setVisState] = useSetState({
    series: [] as BarSeriesOption[],
    xAxis: null as EChartsOption['xAxis'] | null,
    yAxis: null as EChartsOption['yAxis'] | null,
  });

  const hasSelected = React.useMemo(() => (selectedMap ? Object.values(selectedMap).some((selected) => selected) : false), [selectedMap]);

  const getDataForAggregationType = React.useCallback(
    (group: string, selected: 'selected' | 'unselected') => {
      if (aggregatedData) {
        switch (config?.aggregateType) {
          case EAggregateTypes.COUNT:
            return aggregatedData.categoriesList.map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].count,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.AVG:
            return aggregatedData.categoriesList.map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].sum / aggregatedData.categories[category].groups[group][selected].count,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.MIN:
            return aggregatedData.categoriesList.map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].min,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.MAX:
            return aggregatedData.categoriesList.map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].max,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.MED:
            return aggregatedData.categoriesList.map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: median(aggregatedData.categories[category].groups[group][selected].nums) as number,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          default:
            console.warn(`Aggregation type ${config?.aggregateType} is not supported by bar chart.`);
            return [];
        }
      }
      console.warn(`No data available`);
      return null;
    },
    [aggregatedData, config],
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
        large: true,

        // enable click events on bars -> handled by chartInstance callback
        triggerEvent: true,

        clip: false,
        catColumnSelected: config?.catColumnSelected,
        group: config?.group,
      }) as BarSeriesOption,
    [config?.catColumnSelected, config?.display, config?.group, config?.groupType],
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
          confine: true,
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
          containLabel: false,
          left: 100,
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
          setVisState((v) => {
            console.log({ visState: v });
            return {
              ...v,
              series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]!.data! })),

              yAxis: {
                ...v.yAxis,
                type: 'category' as const,
                data: sortedSeries[0]?.categories as string[],
                // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
                inverse: true,
              },
            };
          });
        }
        if (config?.direction === EBarDirection.VERTICAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            config?.sortState?.y,
          );

          setVisState((v) => {
            console.log({ visState: v });
            return {
              ...v,
              series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]!.data })),
              xAxis: { ...v.xAxis, type: 'category' as const, data: sortedSeries[0]?.categories },
            };
          });
        }
      }
    },
    [config?.direction, config?.sortState?.x, config?.sortState?.y, setVisState],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    if (config?.direction === EBarDirection.HORIZONTAL) {
      setVisState((v) => {
        console.log({ visState: v });
        return {
          ...v,

          xAxis: {
            type: 'value' as const,
            name: config?.aggregateType,
            nameLocation: 'middle',
            nameGap: 32,
            min: globalMin,
            max: globalMax,
          },

          yAxis: {
            type: 'category' as const,
            name: config?.catColumnSelected?.name,
            nameLocation: 'middle',
            nameGap: 72,
            axisLabel: {
              show: true,
              formatter: (value: string) => {
                // NOTE: @dv-usama-ansari: Use an abstract element to calculate the width of the text and truncate it accordingly.
                const textEl = document.createElement('div');
                textEl.innerText = value;
                // ...

                // return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
                return value;
              },
              // TODO: add tooltip for truncated labels (@see https://github.com/apache/echarts/issues/19616 and workaround https://codepen.io/plainheart/pen/jOGBrmJ)
            },
          },
        };
      });
    }
    if (config?.direction === EBarDirection.VERTICAL) {
      setVisState((v) => {
        console.log({ visState: v });
        return {
          ...v,

          xAxis: {
            type: 'category' as const,
            name: config?.catColumnSelected?.name,
            nameLocation: 'middle',
            nameGap: 64,
            axisLabel: {
              show: true,
              // formatter: (value: string) => {
              //   return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
              // },
              rotate: 45,
            },
          },

          yAxis: {
            type: 'value' as const,
            name: config?.aggregateType,
            nameLocation: 'middle',
            nameGap: 40,
            min: globalMin,
            max: globalMax,
          },
        };
      });
    }
  }, [config?.aggregateType, config?.catColumnSelected?.name, config?.direction, globalMax, globalMin, setVisState]);

  const updateCategoriesSideEffect = React.useCallback(() => {
    const barSeries = (aggregatedData?.groupingsList ?? [])
      .map((group) => {
        return (['selected', 'unselected'] as const).map((items) => {
          const data = getDataForAggregationType(group, items);

          if (!data) {
            return null;
          }
          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => [Infinity, -Infinity].includes(d.value as number) || Number.isNaN(d.value))) {
            return null;
          }
          const isGrouped = config?.group && groupColorScale != null;
          const isSelectedCase = items === 'selected';
          const shouldLowerOpacity = hasSelected && isGrouped && !isSelectedCase;
          const lowerBarOpacity = shouldLowerOpacity ? { opacity: VIS_UNSELECTED_OPACITY } : {};
          const fixLabelColor = shouldLowerOpacity ? { opacity: 0.5, color: DEFAULT_COLOR } : {};
          return {
            ...barSeriesBase,
            name: aggregatedData.groupingsList.length > 1 ? group : null,
            label: {
              show: true,
              ...fixLabelColor,
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
            group,
            selected: items,

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
    aggregatedData?.groupingsList,
    barSeriesBase,
    config?.group,
    config?.groupType,
    getDataForAggregationType,
    groupColorScale,
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
            const ids: string[] = config?.group
              ? config.group.id === config?.facets?.id
                ? [
                    ...(aggregatedData?.categories[params.name]?.groups[selectedFacetValue!]?.unselected.ids ?? []),
                    ...(aggregatedData?.categories[params.name]?.groups[selectedFacetValue!]?.selected.ids ?? []),
                  ]
                : [
                    ...(aggregatedData?.categories[params.name]?.groups[params.seriesName!]?.unselected.ids ?? []),
                    ...(aggregatedData?.categories[params.name]?.groups[params.seriesName!]?.selected.ids ?? []),
                  ]
              : (aggregatedData?.categories[params.name]?.ids ?? []);

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
