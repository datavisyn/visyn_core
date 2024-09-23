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
 * @param sortMetadata
 * @returns
 */
function sortSeries(
  series: { categories: string[]; data: BarSeriesOption['data'] }[],
  sortMetadata: { sortState: { x: EBarSortState; y: EBarSortState }; direction: EBarDirection } = {
    sortState: { x: EBarSortState.NONE, y: EBarSortState.NONE },
    direction: EBarDirection.HORIZONTAL,
  },
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
  // NOTE: @dv-usama-ansari: Code optimized for readability.
  const sortedCategories = Object.keys(aggregatedData).sort((a, b) => {
    if (a === NAN_REPLACEMENT) {
      return 1;
    }
    if (b === NAN_REPLACEMENT) {
      return -1;
    }
    if (sortMetadata.direction === EBarDirection.HORIZONTAL) {
      if (sortMetadata.sortState.x === EBarSortState.ASCENDING) {
        return (aggregatedData[a] as number) - (aggregatedData[b] as number);
      }
      if (sortMetadata.sortState.x === EBarSortState.DESCENDING) {
        return (aggregatedData[b] as number) - (aggregatedData[a] as number);
      }
      if (sortMetadata.sortState.y === EBarSortState.ASCENDING) {
        return a.localeCompare(b);
      }
      if (sortMetadata.sortState.y === EBarSortState.DESCENDING) {
        return b.localeCompare(a);
      }
      if (sortMetadata.sortState.x === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
      if (sortMetadata.sortState.y === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
    }
    if (sortMetadata.direction === EBarDirection.VERTICAL) {
      if (sortMetadata.sortState.x === EBarSortState.ASCENDING) {
        return a.localeCompare(b);
      }
      if (sortMetadata.sortState.x === EBarSortState.DESCENDING) {
        return b.localeCompare(a);
      }
      if (sortMetadata.sortState.y === EBarSortState.ASCENDING) {
        return (aggregatedData[a] as number) - (aggregatedData[b] as number);
      }
      if (sortMetadata.sortState.y === EBarSortState.DESCENDING) {
        return (aggregatedData[b] as number) - (aggregatedData[a] as number);
      }
      if (sortMetadata.sortState.x === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
      if (sortMetadata.sortState.y === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
    }
    return 0;
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
  containerWidth,
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
  containerWidth: number;
  globalMax?: number;
  globalMin?: number;
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

  const truncatedTextRef = React.useRef<{ labels: { [value: string]: string }; longestLabelWidth: number; containerWidth: number }>({
    labels: {},
    longestLabelWidth: 0,
    containerWidth,
  });

  const [gridLeft, setGridLeft] = React.useState(containerWidth / 3);

  const getTruncatedText = React.useCallback(
    (value: string, parentWidth: number) => {
      // NOTE: @dv-usama-ansari: This might be a performance bottleneck if the number of labels is very high and/or the parentWidth changes frequently (when the viewport is resized).
      if (containerWidth === truncatedTextRef.current.containerWidth && truncatedTextRef.current.labels[value] !== undefined) {
        return truncatedTextRef.current.labels[value];
      }

      const textEl = document.createElement('p');
      textEl.style.position = 'absolute';
      textEl.style.visibility = 'hidden';
      textEl.style.whiteSpace = 'nowrap';
      textEl.style.maxWidth = `${Math.max(gridLeft, parentWidth / 3) - 20}px`;
      textEl.innerText = value;

      document.body.appendChild(textEl);
      truncatedTextRef.current.longestLabelWidth = Math.max(truncatedTextRef.current.longestLabelWidth, textEl.scrollWidth);

      let truncatedText = '';
      for (let i = 0; i < value.length; i++) {
        textEl.innerText = `${truncatedText + value[i]}...`;
        if (textEl.scrollWidth > textEl.clientWidth) {
          truncatedText += '...';
          break;
        }
        truncatedText += value[i];
      }

      document.body.removeChild(textEl);

      truncatedTextRef.current.labels[value] = truncatedText;
      return truncatedText;
    },
    [containerWidth, gridLeft],
  );

  // NOTE: @dv-usama-ansari: We might need an optimization here.
  React.useEffect(() => {
    aggregatedData.categoriesList.forEach((category) => {
      truncatedTextRef.current.labels[category] = getTruncatedText(category, containerWidth);
    });
    setGridLeft(Math.min(containerWidth / 3, truncatedTextRef.current.longestLabelWidth + 20));
  }, [aggregatedData.categoriesList, containerWidth, getTruncatedText]);

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
            config?.group && config?.groupType === EBarGroupingType.STACK && config?.display === EBarDisplayType.NORMALIZED
              ? `${params.value}%`
              : String(params.value),
        },

        labelLayout: {
          hideOverlap: true,
        },

        sampling: 'average',
        large: true,

        // enable click events on bars -> handled by chartInstance callback in `useChart.mouseEvents.click`
        triggerEvent: true,

        clip: false,
        catColumnSelected: config?.catColumnSelected,
        group: config?.group,
      }) as BarSeriesOption,
    [config?.catColumnSelected, config?.display, config?.group, config?.groupType],
  );

  const optionBase = React.useMemo(() => {
    return {
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
          text: selectedFacetValue ?? `${config?.catColumnSelected?.name} vs ${config?.aggregateType}`,
          triggerEvent: true,
          name: 'facetTitle',
        },
      ],

      grid: {
        containLabel: false,
        left: Math.min(gridLeft, containerWidth / 3),
        top: 55, // NOTE: @dv-usama-ansari: Arbitrary value!
        right: 20,
      },

      legend: {
        orient: 'horizontal',
        top: 30,
        type: 'scroll',
        icon: 'circle',
      },
    } as EChartsOption;
  }, [chartHeight, config?.aggregateType, config?.catColumnSelected?.name, containerWidth, gridLeft, selectedFacetValue]);

  const updateSortSideEffect = React.useCallback(
    ({ barSeries = [] }: { barSeries: (BarSeriesOption & { categories: string[] })[] }) => {
      if (barSeries.length > 0) {
        if (config?.direction === EBarDirection.HORIZONTAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.HORIZONTAL },
          );
          setVisState((v) => ({
            ...v,
            // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
            series: barSeries.map((item, itemIndex) => ({ ...item, data: [...sortedSeries[itemIndex]!.data!].reverse() })),
            yAxis: {
              ...v.yAxis,
              type: 'category' as const,
              data: [...(sortedSeries[0]?.categories as string[])].reverse(),
            },
          }));
        }
        if (config?.direction === EBarDirection.VERTICAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.VERTICAL },
          );

          setVisState((v) => ({
            ...v,
            series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]!.data })),
            xAxis: { ...v.xAxis, type: 'category' as const, data: sortedSeries[0]?.categories },
          }));
        }
      }
    },
    [config?.direction, config?.sortState, setVisState],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    if (config?.direction === EBarDirection.HORIZONTAL) {
      setVisState((v) => ({
        ...v,

        xAxis: {
          type: 'value' as const,
          name: config?.aggregateType,
          nameLocation: 'middle',
          nameGap: 32,
          min: globalMin ?? 'dataMin',
          max: globalMax ?? 'dataMax',
          axisLabel: {
            hideOverlap: true,
          },
        },

        yAxis: {
          type: 'category' as const,
          name: config?.catColumnSelected?.name,
          nameLocation: 'middle',
          nameGap: Math.min(gridLeft, containerWidth / 3) - 20,
          data: (v.yAxis as { data: number[] })?.data ?? [],
          axisPointer: {
            show: true,
            type: 'none',
            triggerTooltip: false,
          },
          axisLabel: {
            show: true,
            width: gridLeft - 20,
            formatter: (value: string) => {
              const truncatedText = truncatedTextRef.current.labels[value];
              return truncatedText;
            },
          },
        },
      }));
    }
    if (config?.direction === EBarDirection.VERTICAL) {
      setVisState((v) => ({
        ...v,

        // NOTE: @dv-usama-ansari: xAxis is not showing labels as expected for the vertical bar chart.
        xAxis: {
          type: 'category' as const,
          name: config?.catColumnSelected?.name,
          nameLocation: 'middle',
          nameGap: 32,
          data: (v.xAxis as { data: number[] })?.data ?? [],
          axisLabel: {
            show: true,
            formatter: (value: string) => {
              const truncatedText = truncatedTextRef.current.labels[value];
              return truncatedText;
            },
            rotate: 45,
          },
        },

        yAxis: {
          type: 'value' as const,
          name: config?.aggregateType,
          nameLocation: 'middle',
          nameGap: containerWidth / 3 - 20,
          min: globalMin ?? 'dataMin',
          max: globalMax ?? 'dataMax',
          axisLabel: {
            hideOverlap: true,
          },
        },
      }));
    }
  }, [config?.aggregateType, config?.catColumnSelected?.name, config?.direction, containerWidth, globalMax, globalMin, gridLeft, setVisState]);

  const updateCategoriesSideEffect = React.useCallback(() => {
    const barSeries = (aggregatedData?.groupingsList ?? [])
      .map((g) => {
        return (['selected', 'unselected'] as const).map((s) => {
          const data = getDataForAggregationType(g, s);

          if (!data) {
            return null;
          }
          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => [Infinity, -Infinity].includes(d.value as number) || Number.isNaN(d.value))) {
            return null;
          }
          const isGrouped = config?.group && groupColorScale != null;
          const isSelected = s === 'selected';
          const shouldLowerOpacity = hasSelected && isGrouped && !isSelected;
          const lowerBarOpacity = shouldLowerOpacity ? { opacity: VIS_UNSELECTED_OPACITY } : {};
          const fixLabelColor = shouldLowerOpacity ? { opacity: 0.5, color: DEFAULT_COLOR } : {};
          return {
            ...barSeriesBase,
            name: aggregatedData.groupingsList.length > 1 ? g : null,
            label: {
              ...barSeriesBase.label,
              ...fixLabelColor,
              show: true,
            },
            itemStyle: {
              color:
                g === NAN_REPLACEMENT
                  ? isSelected
                    ? SELECT_COLOR
                    : VIS_NEUTRAL_COLOR
                  : isGrouped
                    ? groupColorScale(g) || VIS_NEUTRAL_COLOR
                    : VIS_NEUTRAL_COLOR,

              ...lowerBarOpacity,
            },
            data: data.map((d) => (d.value === 0 ? null : d.value)) as number[],
            categories: data.map((d) => d.category),
            group: g,
            selected: s,

            // group = individual group names, stack = any fixed name
            stack: config?.groupType === EBarGroupingType.STACK ? 'total' : g,
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
              // NOTE: @dv-usama-ansari: Early return if the bar is clicked and it is already selected?
              const isSameBarClicked = (selectedList ?? []).length > 0 && (selectedList ?? []).every((id) => ids.includes(id));
              if (isSameBarClicked) {
                selectionCallback(event, []);
              } else {
                selectionCallback(event, ids);
              }
            }
          },
        },
      ],
    },
  });

  console.log({ options: options.grid });

  return options && containerWidth !== 0 ? (
    <div ref={setRef} style={{ width: `${containerWidth}px`, height: `${chartHeight + CHART_HEIGHT_MARGIN}px` }} />
  ) : null;
}

export const SingleEChartsBarChart = React.memo(EagerSingleEChartsBarChart);
