import type { ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';
import { ECharts } from 'echarts/core';
import { round, uniq } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VIS_NEUTRAL_COLOR } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState, IBarConfig, IBarDataTableRow } from './interfaces';
import { ReactECharts, ReactEChartsProps } from './ReactECharts';

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
const AXIS_LABEL_MAX_LENGTH = 50;

type SortState = { x: EBarSortState; y: EBarSortState };

const median = (arr) => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  const medianVal = arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  return medianVal;
};

/**
 * Calculates and returns the rounded absolute or normalized value, dependending on the config value.
 * Enabled grouping always returns the absolute value. The normalized value is only calculated for stacked bars.
 * @param config Bar chart configuration
 * @param value Absolute value
 * @param total Number of values in the category
 * @returns Returns the rounded absolute value. Otherwise returns the rounded normalized value.
 */
const normalizedValue = ({ config, value, total }: { config: IBarConfig; value: number; total: number }) =>
  config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
    ? round((value / total) * 100, 2)
    : round(value, 4);

export function SingleEChartsBarChart({
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
  const [sortState, setSortState] = useState<SortState>({ x: EBarSortState.NONE, y: EBarSortState.NONE });

  const [series, setSeries] = useState<BarSeriesOption[]>([]);
  const [option, setOption] = useState<ReactEChartsProps['option']>(null);
  const [xAxis, setXAxis] = useState<ReactEChartsProps['option']['xAxis']>(null);
  const [yAxis, setYAxis] = useState<ReactEChartsProps['option']['yAxis']>(null);

  const filteredDataTable = useMemo(
    () => (selectedFacetValue ? dataTable.filter((item) => item.facet === selectedFacetValue) : dataTable),
    [dataTable, selectedFacetValue],
  );

  const { aggregatedData, categories, groupings, hasSelected } = useMemo(() => {
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
      const targetGroup = selected ? values[category][grouping].selected : values[category][grouping].unselected;
      targetGroup.count++;
      targetGroup.sum += agg;
      targetGroup.min = Math.min(targetGroup.min, agg);
      targetGroup.max = Math.max(targetGroup.max, agg);
      targetGroup.nums.push(agg);
      targetGroup.ids.push(item.id);
    });
    return {
      aggregatedData: values,
      categories: uniq(filteredDataTable.map((item) => item.category)),
      groupings: uniq(filteredDataTable.map((item) => item.group)),
      hasSelected: selectedMap ? Object.values(selectedMap).some((selected) => selected) : false,
    };
  }, [filteredDataTable, selectedMap]);

  const calculateChartHeight = useMemo(() => {
    // use fixed height for vertical bars
    if (config.direction === EBarDirection.VERTICAL) {
      return 250;
    }

    // calculate height for horizontal bars
    const categoryWidth = config.group && config.groupType === EBarGroupingType.STACK ? BAR_WIDTH + BAR_SPACING : (BAR_WIDTH + BAR_SPACING) * groupings.length; // TODO: Make dynamic group length based on series data filtered for null
    const chartHeight = categories.length * categoryWidth;
    return chartHeight;
  }, [categories.length, config.direction, config.group, config.groupType, groupings.length]);

  const getDataForAggregationType = useCallback(
    // NOTE: @dv-usama-ansari: Weird eslint error, but the props are used in the function.
    // eslint-disable-next-line react/no-unused-prop-types
    ({ group, selected }: { group: string; selected: 'selected' | 'unselected' }) => {
      switch (config.aggregateType) {
        case EAggregateTypes.COUNT:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[cat][group][selected].count, total: aggregatedData[cat].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.AVG:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected]
              ? normalizedValue({
                  config,
                  value: aggregatedData[cat][group][selected].sum / aggregatedData[cat][group][selected].count,
                  total: aggregatedData[cat].total,
                })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MIN:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[cat][group][selected].min, total: aggregatedData[cat].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MAX:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected]
              ? normalizedValue({ config, value: aggregatedData[cat][group][selected].max, total: aggregatedData[cat].total })
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MED:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected]
              ? normalizedValue({ config, value: median(aggregatedData[cat][group][selected].nums), total: aggregatedData[cat].total })
              : 0,
            category: categories[index],
          }));

        default:
          console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
          return null;
      }
    },
    [aggregatedData, categories, config],
  );

  // prepare data
  const barSeriesBase = useMemo(
    () =>
      ({
        type: 'bar',
        emphasis: { focus: 'series' },
        barWidth: BAR_WIDTH,

        label: {
          show: true,
          formatter: (params) =>
            // grouping always uses the absolute value
            config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
              ? `${params.value}%`
              : String(params.value),
        },

        // enable click events on bars -> handled by chartInstance callback
        triggerEvent: true,
      }) as BarSeriesOption,
    [config.display, config.group, config.groupType],
  );

  const optionBase: ReactEChartsProps['option'] = useMemo(
    () =>
      ({
        height: `${calculateChartHeight}px`,
        animation: false,

        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow',
          },
          backgroundColor: 'var(--tooltip-bg,var(--mantine-color-gray-9, #000))',
          borderWidth: 0,
          borderColor: 'transparent',
          textStyle: {
            color: 'var(--tooltip-color,var(--mantine-color-white, #FFF))',
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
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },

        legend: {},
      }) as ReactEChartsProps['option'],
    [calculateChartHeight, selectedFacetValue],
  );

  const updateSortSideEffect = useCallback(
    ({ barSeries = [] }: { barSeries: BarSeriesOption[] }) => {
      if (config.direction === EBarDirection.HORIZONTAL) {
        switch (sortState.x) {
          case EBarSortState.ASCENDING:
            setSeries(() =>
              barSeries.map((item) => {
                const itemClone = { ...item } as typeof item & { categories: string[] };
                const dataWithCategories = itemClone.data.map((value, index) => ({ value: value as number, category: itemClone.categories[index] }));
                const sortedDataWithCategories = dataWithCategories.sort((a, b) => b.value - a.value);
                setYAxis((y) => ({ ...y, data: sortedDataWithCategories.map((d) => d.category) }));
                return { ...itemClone, data: sortedDataWithCategories.map((d) => d.value) };
              }),
            );
            break;
          case EBarSortState.DESCENDING:
            setSeries(() =>
              barSeries.map((item) => {
                const itemClone = { ...item } as typeof item & { categories: string[] };
                const dataWithCategories = itemClone.data.map((value, index) => ({ value: value as number, category: itemClone.categories[index] }));
                const sortedDataWithCategories = dataWithCategories.sort((a, b) => a.value - b.value);
                setYAxis((y) => ({ ...y, data: sortedDataWithCategories.map((d) => d.category) }));
                return { ...itemClone, data: sortedDataWithCategories.map((d) => d.value) };
              }),
            );
            break;
          case EBarSortState.NONE:
            setSeries(() =>
              barSeries.map((item) => {
                const itemClone = { ...item } as typeof item & { categories: string[] };
                setYAxis((y) => ({ ...y, data: itemClone.categories }));
                return itemClone;
              }),
            );
            break;
          default:
            break;
        }
      }
      if (config.direction === EBarDirection.VERTICAL) {
        switch (sortState.y) {
          case EBarSortState.ASCENDING:
            setSeries(() =>
              barSeries.map((item) => {
                const itemClone = { ...item } as typeof item & { categories: string[] };
                const dataWithCategories = itemClone.data.map((value, index) => ({ value: value as number, category: itemClone.categories[index] }));
                const sortedDataWithCategories = dataWithCategories.sort((a, b) => b.value - a.value);
                setXAxis((x) => ({ ...x, data: sortedDataWithCategories.map((d) => d.category) }));
                return { ...itemClone, data: sortedDataWithCategories.map((d) => d.value) };
              }),
            );
            break;
          case EBarSortState.DESCENDING:
            setSeries(() =>
              barSeries.map((item) => {
                const itemClone = { ...item } as typeof item & { categories: string[] };
                const dataWithCategories = itemClone.data.map((value, index) => ({ value: value as number, category: itemClone.categories[index] }));
                const sortedDataWithCategories = dataWithCategories.sort((a, b) => a.value - b.value);
                setXAxis((x) => ({ ...x, data: sortedDataWithCategories.map((d) => d.category) }));
                return { ...itemClone, data: sortedDataWithCategories.map((d) => d.value) };
              }),
            );
            break;
          case EBarSortState.NONE:
            setSeries(() =>
              barSeries.map((item) => {
                const itemClone = { ...item } as typeof item & { categories: string[] };
                setXAxis((x) => ({ ...x, data: itemClone.categories }));
                return itemClone;
              }),
            );
            break;
          default:
            break;
        }
      }
    },
    [config.direction, sortState.x, sortState.y],
  );

  const chartInstance = useCallback(
    (chart: ECharts) => {
      // remove all listeners to avoid memory leaks and multiple listeners
      chart.off('click');
      // register EChart listerners to chartInstance
      // NOTE: @dv-usama-ansari: Using queries to attach event listeners: https://echarts.apache.org/en/api.html#events
      chart.on('click', { titleIndex: 0 }, () => {
        setConfig({ ...config, focusFacetIndex: config.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
      });

      chart.on('click', { seriesType: 'bar' }, ({ event, seriesName, name }) => {
        selectionCallback(
          event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>,
          filteredDataTable.filter((item) => item.category === name && (!config.group || (config.group && item.group === seriesName))).map((item) => item.id),
        );
      });
    },
    [config, filteredDataTable, selectedFacetIndex, selectionCallback, setConfig],
  );

  const updateDirectionSideEffect = useCallback(() => {
    if (config.direction === EBarDirection.HORIZONTAL) {
      setXAxis({ type: 'value' });
      setYAxis((y) => ({ type: 'category', data: ((y as typeof y & { data: string[] })?.data as string[]) ?? categories }));
    }
    if (config.direction === EBarDirection.VERTICAL) {
      setXAxis((x) => ({ type: 'category', data: ((x as typeof x & { data: string[] })?.data as string[]) ?? categories }));
      setYAxis({ type: 'value' });
    }
  }, [categories, config.direction]);

  const updateCategoriesSideEffect = useCallback(() => {
    const barSeries = groupings
      .map((group) => {
        return (['selected', 'unselected'] as const).map((selected) => {
          const data = getDataForAggregationType({ group, selected });

          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => d.value === 0 || Number.isNaN(d.value))) {
            return null;
          }

          return {
            ...barSeriesBase,
            name: groupings.length > 1 ? group : null,
            itemStyle: {
              color: config.group && groupColorScale ? groupColorScale(group) || VIS_NEUTRAL_COLOR : VIS_NEUTRAL_COLOR,
              // reduce opacity for unselected bars if there are selected items
              opacity: hasSelected ? (selected === 'selected' ? 1 : 0.5) : 1,
            },
            data: data.map((d) => (d.value === 0 ? null : d.value)) as number[],
            categories: data.map((d) => d.category),

            // group = individual group names, stack = any fixed name
            stack: config.groupType === EBarGroupingType.STACK ? 'total' : group,
          } as BarSeriesOption;
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

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the data changes.
  useEffect(() => {
    setOption((o) => {
      let options = { ...o, ...optionBase };
      if (series) {
        options = { ...options, series };
      }
      if (xAxis) {
        options = { ...options, xAxis };
      }
      if (yAxis) {
        options = { ...options, yAxis };
      }
      return options;
    });
  }, [optionBase, series, xAxis, yAxis]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the direction of the bar chart changes.
  useEffect(() => {
    updateDirectionSideEffect();
  }, [config.direction, updateDirectionSideEffect]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the selected categorical column changes.
  useEffect(() => {
    updateCategoriesSideEffect();
  }, [updateCategoriesSideEffect]);

  useEffect(() => {
    if (config.display === EBarDisplayType.NORMALIZED) {
      setSortState({ x: EBarSortState.NONE, y: EBarSortState.NONE });
    } else if (config.sortState) {
      setSortState({ x: config.sortState.x, y: config.sortState.y });
    }
  }, [config.display, config.sortState, config.sortState.x, config.sortState.y]);

  const settings = {
    notMerge: true, // disable merging to avoid stale series data when deselecting the group column
  };

  return (
    option && (
      <ReactECharts
        option={option}
        chartInstance={chartInstance}
        settings={settings}
        style={{ width: '100%', height: `${calculateChartHeight + CHART_HEIGHT_MARGIN}px` }}
      />
    )
  );
}
