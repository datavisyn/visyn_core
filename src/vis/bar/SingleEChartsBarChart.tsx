import { Text } from '@mantine/core';
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

  /**
   * Calculates and returns the rounded absolute or normalized value, dependending on the config value.
   * Enabled grouping always returns the absolute value. The normalized value is only calculated for stacked bars.
   * @param value Absolute value
   * @param total Number of values in the category
   * @returns Returns the rounded absolute value. Otherwise returns the rounded normalized value.
   */
  const normalizedValue = useCallback(
    (value: number, total: number) => {
      return config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
        ? round((value / total) * 100, 2)
        : round(value, 4);
    },
    [config.display, config.group, config.groupType],
  );

  const calculateChartHeight = useMemo(() => {
    // use fixed height for vertical bars
    if (config.direction === EBarDirection.VERTICAL) {
      return 250;
    }

    // calculate height for horizontal bars
    const categoryWidth = config.group && config.groupType === EBarGroupingType.STACK ? BAR_WIDTH + BAR_SPACING : (BAR_WIDTH + BAR_SPACING) * groupings.length; // TODO: Make dynamic group length based on series data filtered for null
    const chartHeight = categories.length * categoryWidth;
    // console.log('barWidth', { barWidth: categoryWidth, chartHeight, groupingsLength: groupings.length, categoriesLength: categories.length });
    return chartHeight;
  }, [categories.length, config.direction, config.group, config.groupType, groupings.length]);

  const getDataForAggregationType = useCallback(
    // NOTE: @dv-usama-ansari: Weird eslint error, but the props are used in the function.
    // eslint-disable-next-line react/no-unused-prop-types
    ({ group, selected }: { group: string; selected: 'selected' | 'unselected' }) => {
      switch (config.aggregateType) {
        case EAggregateTypes.COUNT:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(aggregatedData[cat][group][selected].count, aggregatedData[cat].total) : 0,
            category: categories[index],
          }));

        case EAggregateTypes.AVG:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected]
              ? normalizedValue(aggregatedData[cat][group][selected].sum / aggregatedData[cat][group][selected].count, aggregatedData[cat].total)
              : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MIN:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(aggregatedData[cat][group][selected].min, aggregatedData[cat].total) : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MAX:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(aggregatedData[cat][group][selected].max, aggregatedData[cat].total) : 0,
            category: categories[index],
          }));

        case EAggregateTypes.MED:
          return categories.map((cat, index) => ({
            value: aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(median(aggregatedData[cat][group][selected].nums), aggregatedData[cat].total) : 0,
            category: categories[index],
          }));

        default:
          console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
          return null;
      }
    },
    [aggregatedData, categories, config.aggregateType, normalizedValue],
  );

  // prepare data
  const [seriesData, setSeriesData] = useState(
    groupings
      .map((group) => {
        return (['selected', 'unselected'] as const).map((selected) => {
          const data = getDataForAggregationType({ group, selected });

          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => d.value === 0 || Number.isNaN(d.value))) {
            return null;
          }
          return { data, group, selected };
        });
      })
      .flat()
      .filter(Boolean),
  );

  const baseSeries = useMemo(() => {
    return seriesData.map(
      (data) =>
        ({
          type: 'bar',

          // enable click events on bars -> handled by chartInstance callback
          triggerEvent: true,

          name: groupings.length > 1 ? data.group : null,

          // group = individual group names, stack = any fixed name
          stack: config.groupType === EBarGroupingType.STACK ? 'total' : data.group,

          label: {
            show: true,
            formatter: (params) =>
              // grouping always uses the absolute value
              config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
                ? `${params.value}%`
                : String(params.value),
          },

          emphasis: {
            focus: 'series',
          },

          barWidth: BAR_WIDTH,

          itemStyle: {
            color: config.group && groupColorScale ? groupColorScale(data.group) || VIS_NEUTRAL_COLOR : VIS_NEUTRAL_COLOR,
            opacity: hasSelected ? (data.selected === 'selected' ? 1 : 0.5) : 1, // reduce opacity for unselected bars if there are selected items
          },

          data: data.data.map((d) => (d.value === 0 ? null : d.value)) as number[],
          categories: data.data.map((d) => d.category),
        }) as BarSeriesOption,
    );
  }, [config.display, config.group, config.groupType, groupColorScale, groupings.length, hasSelected, seriesData]);

  const [xAxis, setXAxis] = useState<ReactEChartsProps['option']['xAxis']>(null);
  const [yAxis, setYAxis] = useState<ReactEChartsProps['option']['yAxis']>(null);

  const baseOption: ReactEChartsProps['option'] = useMemo(() => {
    let options = {
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

        {
          text: config.direction === EBarDirection.HORIZONTAL ? 'Sort along X-axis' : '',
          left: '50%',
          top: '90%',
          textStyle: {
            fontSize: 14,
            color: '#000',
          },
          triggerEvent: true,
        },

        {
          text: config.direction === EBarDirection.VERTICAL ? 'Sort along Y-axis' : '',
          left: '0%',
          top: '50%',
          textStyle: {
            fontSize: 14,
            color: '#000',
          },
          triggerEvent: true,
        },
      ],

      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },

      legend: {},
      series,
    } as ReactEChartsProps['option'];
    if (xAxis) {
      options = { ...options, xAxis };
    }
    if (yAxis) {
      options = { ...options, yAxis };
    }
    return options;
  }, [calculateChartHeight, config.direction, selectedFacetValue, series, xAxis, yAxis]);

  const handleSort = useCallback(
    (axis: 'x' | 'y') => {
      setSortState((prevSortState) => {
        const newSortState = { ...prevSortState };
        if (config.direction === EBarDirection.HORIZONTAL && axis === 'x') {
          newSortState.x =
            prevSortState.x === EBarSortState.NONE
              ? EBarSortState.ASCENDING
              : prevSortState.x === EBarSortState.ASCENDING
                ? EBarSortState.DESCENDING
                : EBarSortState.NONE;
          newSortState.y = EBarSortState.NONE;
        } else if (config.direction === EBarDirection.VERTICAL && axis === 'y') {
          newSortState.x = EBarSortState.NONE;
          newSortState.y =
            prevSortState.y === EBarSortState.NONE
              ? EBarSortState.ASCENDING
              : prevSortState.y === EBarSortState.ASCENDING
                ? EBarSortState.DESCENDING
                : EBarSortState.NONE;
        }
        return newSortState;
      });
    },
    [config.direction],
  );

  const updateSortSideEffect = useCallback(() => {
    switch (sortState.x) {
      case EBarSortState.ASCENDING:
        setSeriesData((s) =>
          s.map((item) => {
            const sortedDataWithCategories = item.data.sort((a, b) => a.value - b.value);
            setYAxis((y) => ({ ...y, data: sortedDataWithCategories.map((d) => d.category) }));
            return { ...item, data: sortedDataWithCategories };
          }),
        );
        break;
      case EBarSortState.DESCENDING:
        setSeriesData((s) =>
          s.map((item) => {
            const sortedDataWithCategories = item.data.sort((a, b) => b.value - a.value);
            setYAxis((y) => ({ ...y, data: sortedDataWithCategories.map((d) => d.category) }));
            return { ...item, data: sortedDataWithCategories };
          }),
        );
        break;
      case EBarSortState.NONE:
        // TODO: @dv-usama-ansari: Implement default sorting
        break;
      default:
        break;
    }
    switch (sortState.y) {
      case EBarSortState.ASCENDING:
        setSeriesData((s) =>
          s.map((item) => {
            const sortedDataWithCategories = item.data.sort((a, b) => a.value - b.value);
            setXAxis((x) => ({ ...x, data: sortedDataWithCategories.map((d) => d.category) }));
            return { ...item, data: sortedDataWithCategories };
          }),
        );
        break;
      case EBarSortState.DESCENDING:
        setSeriesData((s) =>
          s.map((item) => {
            const sortedDataWithCategories = item.data.sort((a, b) => b.value - a.value);
            setXAxis((x) => ({ ...x, data: sortedDataWithCategories.map((d) => d.category) }));
            return { ...item, data: sortedDataWithCategories };
          }),
        );
        break;
      case EBarSortState.NONE:
        // TODO: @dv-usama-ansari: Implement default sorting
        break;
      default:
        break;
    }
  }, [sortState.x, sortState.y]);

  const chartInstance = useCallback(
    (chart: ECharts) => {
      // remove all listeners to avoid memory leaks and multiple listeners
      chart.off('click');
      // register EChart listerners to chartInstance
      // NOTE: @dv-usama-ansari: Using queries to attach event listeners: https://echarts.apache.org/en/api.html#events
      chart.on('click', { titleIndex: 0 }, ({ componentType, event, seriesName, name, ...rest }) => {
        setConfig({ ...config, focusFacetIndex: config.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
      });
      chart.on('click', { titleIndex: 1 }, () => {
        handleSort('x');
        updateSortSideEffect();
      });
      chart.on('click', { titleIndex: 2 }, () => {
        handleSort('y');
        updateSortSideEffect();
      });
      chart.on('click', { seriesType: 'bar' }, ({ componentType, event, seriesName, name, ...rest }) => {
        selectionCallback(
          event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>,
          filteredDataTable.filter((item) => item.category === name && (!config.group || (config.group && item.group === seriesName))).map((item) => item.id),
        );
      });
    },
    [config, filteredDataTable, handleSort, selectedFacetIndex, selectionCallback, setConfig, updateSortSideEffect],
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

  useEffect(() => {
    setSeries(baseSeries);
  }, [baseSeries]);

  useEffect(() => {
    setOption(baseOption);
  }, [baseOption]);

  useEffect(() => {
    updateDirectionSideEffect();
  }, [config.direction, updateDirectionSideEffect]);

  const settings = {
    notMerge: true, // disable merging to avoid stale series data when deselecting the group column
  };

  return (
    option &&
    series &&
    xAxis &&
    yAxis && (
      <>
        <Text>Sorting {config.direction === EBarDirection.HORIZONTAL ? `x axis ${sortState.x}` : `y axis ${sortState.y}`} </Text>
        <ReactECharts
          option={option}
          chartInstance={chartInstance}
          settings={settings}
          style={{ width: '100%', height: `${calculateChartHeight + CHART_HEIGHT_MARGIN}px` }}
        />
      </>
    )
  );
}
