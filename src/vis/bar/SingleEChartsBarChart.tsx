import type { BarSeriesOption } from 'echarts/charts';
import { groupBy, maxBy, meanBy, minBy, round, uniq, zipObject, zipWith } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './interfaces';
import { ReactECharts, ReactEChartsProps } from './ReactECharts';
import { getBarData } from './utils';
import { getLabelOrUnknown } from '../general/utils';

export function SingleEChartsBarChart({
  config,
  setConfig,
  selectedList,
  selectedMap,
  selectionCallback,
  allColumns,
  selectedFacetValue,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedMap' | 'selectedList' | 'selectionCallback'> & {
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  selectedFacetValue?: string;
}) {
  // console.log(config, allColumns);

  const dataTable = useMemo(() => {
    const table = zipWith(
      allColumns.catColVals?.resolvedValues,
      allColumns.aggregateColVals?.resolvedValues,
      allColumns.groupColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.facetsColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      (cat, agg, group, facet) => {
        return {
          id: cat.id,
          category: getLabelOrUnknown(cat?.val),
          agg: agg?.val as number,
          group: typeof group?.val === 'number' ? String(group?.val) : getLabelOrUnknown(group?.val),
          facet: getLabelOrUnknown(facet?.val),
        };
      },
    );

    return selectedFacetValue ? table.filter((item) => item.facet === selectedFacetValue) : table;
  }, [
    allColumns.aggregateColVals?.resolvedValues,
    allColumns.catColVals?.resolvedValues,
    allColumns.facetsColVals?.resolvedValues,
    allColumns.groupColVals?.resolvedValues,
    selectedFacetValue,
  ]);

  // console.log('dataTable', dataTable, selectedFacetValue);

  const { aggregatedData, categories, groupings } = useMemo(() => {
    const values = {};
    dataTable.forEach((item) => {
      const { category, agg, group: grouping } = item;
      if (!values[category]) {
        values[category] = { total: 0 };
      }
      if (!values[category][grouping]) {
        values[category][grouping] = { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [] };
      }

      values[category].total++;

      const group = values[category][grouping];
      group.count++;
      group.sum += agg;
      group.min = Math.min(group.min, agg);
      group.max = Math.max(group.max, agg);
      group.nums.push(agg);
    });
    return { aggregatedData: values, categories: Object.keys(values), groupings: uniq(dataTable.map((item) => item.group)) };
  }, [dataTable]);

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
        data,
      };
    });
  }, [aggregatedData, categories, config.aggregateType, config.display, config.groupType, groupings]);

  const chartInstance = useCallback((chart) => {
    // register EChart listerners to chartInstance
    chart.on('click', (args) => {
      // TODO handle click events
      console.log('clicked', args);
    });
  }, []);

  let option: ReactEChartsProps['option'] = {
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
  return <ReactECharts option={option} chartInstance={chartInstance} settings={settings} />;
}
