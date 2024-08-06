import type { ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';
import { round, uniq } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { VIS_NEUTRAL_COLOR } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, IBarDataTableRow } from './interfaces';
import { ReactECharts, ReactEChartsProps } from './ReactECharts';

/**
 * Width of a single bar when stacked or a regular bar
 */
const BAR_WIDTH_STACKED = 40;

/**
 * Width of a single bar when grouped
 */
const BAR_WIDTH_GROUPED = 20;

/**
 * Spacing between bars in a category
 */
const BAR_SPACING = 10;

/**
 * Height margin for the chart to avoid cutting off bars, legend, title, axis labels, etc.
 */
const CHART_HEIGHT_MARGIN = 100;

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
  const BAR_WIDTH = config.groupType === EBarGroupingType.GROUP ? BAR_WIDTH_GROUPED : BAR_WIDTH_STACKED;
  // console.log(config, dataTable, selectedFacetValue);

  const filteredDataTable = useMemo(() => {
    return selectedFacetValue ? dataTable.filter((item) => item.facet === selectedFacetValue) : dataTable;
  }, [dataTable, selectedFacetValue]);

  // console.log('filteredDataTable', filteredDataTable);

  const { aggregatedData, categories, groupings } = useMemo(() => {
    const values = {};
    filteredDataTable.forEach((item) => {
      const { category, agg, group: grouping } = item;
      if (!values[category]) {
        values[category] = { total: 0 };
      }
      if (!values[category][grouping]) {
        values[category][grouping] = { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] };
      }

      values[category].total++;

      const group = values[category][grouping];
      group.count++;
      group.sum += agg;
      group.min = Math.min(group.min, agg);
      group.max = Math.max(group.max, agg);
      group.nums.push(agg);
      group.ids.push(item.id);
    });
    return { aggregatedData: values, categories: Object.keys(values), groupings: uniq(filteredDataTable.map((item) => item.group)) };
  }, [filteredDataTable]);

  // console.log('aggregatedData', aggregatedData, categories, groupings);

  // prepare data
  const series: BarSeriesOption[] = useMemo(() => {
    const median = (arr) => {
      const mid = Math.floor(arr.length / 2);
      const nums = [...arr].sort((a, b) => a - b);
      const medianVal = arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
      return medianVal;
    };

    /**
     * Calculates and returns the rounded absolute or normalized value, dependending on the config value.
     * Enabled grouping always returns the absolute value. The normalized value is only calculated for stacked bars.
     * @param value Absolute value
     * @param total Number of values in the category
     * @returns Returns the rounded absolute value. Otherwise returns the rounded normalized value.
     */
    const normalizedValue = (value, total) => {
      return config.groupType === EBarGroupingType.GROUP || config.display === EBarDisplayType.ABSOLUTE ? round(value, 4) : round((value / total) * 100, 2);
    };

    return groupings.map((group) => {
      let data = [];

      switch (config.aggregateType) {
        case EAggregateTypes.COUNT:
          data = categories.map((cat) => (aggregatedData[cat][group] ? normalizedValue(aggregatedData[cat][group].count, aggregatedData[cat].total) : 0));
          break;

        case EAggregateTypes.AVG:
          data = categories.map((cat) =>
            aggregatedData[cat][group] ? normalizedValue(aggregatedData[cat][group].sum / aggregatedData[cat][group].count, aggregatedData[cat].total) : 0,
          );
          break;

        case EAggregateTypes.MIN:
          data = categories.map((cat) => (aggregatedData[cat][group] ? normalizedValue(aggregatedData[cat][group].min, aggregatedData[cat].total) : 0));
          break;

        case EAggregateTypes.MAX:
          data = categories.map((cat) => (aggregatedData[cat][group] ? normalizedValue(aggregatedData[cat][group].max, aggregatedData[cat].total) : 0));
          break;

        case EAggregateTypes.MED:
          data = categories.map((cat) =>
            aggregatedData[cat][group] ? normalizedValue(median(aggregatedData[cat][group].nums), aggregatedData[cat].total) : 0,
          );
          break;

        default:
          console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
          break;
      }

      return {
        type: 'bar',
        triggerEvent: true, // enable click events on bars -> handled by chartInstance callback
        name: groupings.length > 1 ? group : null,
        stack: config.groupType === EBarGroupingType.GROUP ? group : 'total', // group = individual group names, stack = any fixed name
        label: {
          show: true,
          formatter: (params) =>
            // grouping always uses the absolute value
            config.groupType === EBarGroupingType.GROUP || config.display === EBarDisplayType.ABSOLUTE ? String(params.value) : `${params.value}%`,
        },
        emphasis: {
          focus: 'series',
        },
        barWidth: BAR_WIDTH,
        itemStyle: { color: config.group && groupColorScale ? groupColorScale(group) || VIS_NEUTRAL_COLOR : VIS_NEUTRAL_COLOR },
        data,
      };
    });
  }, [BAR_WIDTH, aggregatedData, categories, config.aggregateType, config.display, config.group, config.groupType, groupColorScale, groupings]);

  const chartInstance = useCallback(
    (chart) => {
      // remove all listeners to avoid memory leaks and multiple listeners
      chart.on('click', null);
      // register EChart listerners to chartInstance
      chart.on('click', ({ componentType, event, seriesName, name, ...rest }) => {
        console.log('clicked', { componentType, event, seriesName, name, rest });
        switch (componentType) {
          case 'title':
            setConfig({ ...config, focusFacetIndex: config.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
            break;
          case 'series': // bar click
            selectionCallback(
              event,
              filteredDataTable.filter((item) => item.group === seriesName && item.category === name).map((item) => item.id),
            );
            break;
          default:
            break;
        }
      });
    },
    [config, filteredDataTable, selectedFacetIndex, selectionCallback, setConfig],
  );

  const calculateChartHeight = useMemo(() => {
    // use fixed height for vertical bars
    if (config.direction === EBarDirection.VERTICAL) {
      return 250;
    }

    // calculate height for horizontal bars
    const categoryWidth = config.groupType === EBarGroupingType.GROUP ? (BAR_WIDTH_GROUPED + BAR_SPACING) * groupings.length : BAR_WIDTH_STACKED + BAR_SPACING;
    const chartHeight = categories.length * categoryWidth;
    // console.log('barWidth', { barWidth: categoryWidth, chartHeight, groupingsLength: groupings.length, categoriesLength: categories.length });
    return chartHeight;
  }, [categories.length, config.direction, config.groupType, groupings.length]);

  let option: ReactEChartsProps['option'] = {
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
    title: {
      text: selectedFacetValue || null,
      triggerEvent: true,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    legend: {},
    series,
  };

  if (config.direction === EBarDirection.VERTICAL) {
    option = {
      ...option,
      xAxis: {
        type: 'category',
        data: categories,
      },
      yAxis: {
        type: 'value',
      },
    };
  } else {
    option = {
      ...option,
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: categories,
      },
    };
  }

  const settings = {
    notMerge: true, // disable merging to avoid stale series data when deselecting the group column
  };

  return (
    <ReactECharts
      option={option}
      chartInstance={chartInstance}
      settings={settings}
      style={{ width: '100%', height: `${calculateChartHeight + CHART_HEIGHT_MARGIN}px` }}
    />
  );
}
