import type { BarSeriesOption } from 'echarts/charts';
import { groupBy, maxBy, meanBy, minBy, zipObject, zipWith } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { EBarDirection, IBarConfig } from './interfaces';
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
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedMap' | 'selectedList' | 'selectionCallback'> & {
  allColumns: Awaited<ReturnType<typeof getBarData>>;
}) {
  console.log(config, allColumns);

  const dataTable = useMemo(() => {
    return zipWith(
      allColumns.catColVals?.resolvedValues,
      allColumns.aggregateColVals?.resolvedValues,
      allColumns.facetsColVals?.resolvedValues,
      allColumns.groupColVals?.resolvedValues,
      (cat, agg, facet, group) => {
        return {
          id: cat.id,
          category: getLabelOrUnknown(cat?.val),
          agg: agg?.val,
          facet: facet?.val,
          group: group?.val,
        };
      },
    );
  }, [
    allColumns.aggregateColVals?.resolvedValues,
    allColumns.catColVals?.resolvedValues,
    allColumns.facetsColVals?.resolvedValues,
    allColumns.groupColVals?.resolvedValues,
  ]);

  console.log(dataTable);

  const aggData: { categories: string[]; values: number[] } = useMemo(() => {
    // Helper function for median
    const median = (arr) => {
      const mid = Math.floor(arr.length / 2);
      const nums = [...arr].sort((a, b) => a - b);
      return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    };

    // Using lodash to aggregate data
    const groupedData = groupBy(dataTable, 'category');

    const categories = Object.keys(groupedData);
    let values: number[] = [];

    switch (config.aggregateType) {
      case EAggregateTypes.COUNT:
        values = categories.map((cat) => groupedData[cat].length);
        break;

      case EAggregateTypes.AVG:
        values = categories.map((cat) => meanBy(groupedData[cat], 'agg'));
        break;

      case EAggregateTypes.MIN:
        values = categories.map((cat) => minBy(groupedData[cat], 'agg').agg) as number[];
        break;

      case EAggregateTypes.MED:
        values = categories.map((cat) => median(groupedData[cat].map((item) => item.agg)));
        break;

      case EAggregateTypes.MAX:
        values = categories.map((cat) => maxBy(groupedData[cat], 'agg').agg) as number[];
        break;

      default:
        console.warn(`Aggregation type ${config.aggregateType} not implemented for bar chart!`);
        break;
    }

    return { categories, values };
  }, [config.aggregateType, dataTable]);

  // prepare data
  const series: BarSeriesOption[] = useMemo(() => {
    return [
      {
        type: 'bar',
        name: null,
        label: {
          show: true,
        },
        emphasis: {
          focus: 'series',
        },
        data: aggData.values,
      },
      // {
      //   type: 'bar',
      //   name: 'Group 2',
      //   label: {
      //     show: true,
      //   },
      //   emphasis: {
      //     focus: 'series',
      //   },
      //   data: aggData.values,
      // },
    ];
  }, [aggData]);

  const chartInstance = useCallback((chart) => {
    // register EChart listerners to chartInstance
    chart.on('click', (args) => {
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
  };

  if (config.direction === EBarDirection.VERTICAL) {
    option = {
      ...option,
      xAxis: {
        type: 'category',
        data: aggData.categories,
      },
      yAxis: {
        type: 'value',
      },
      series,
    };
  } else {
    option = {
      ...option,
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: aggData.categories,
      },
      series,
      // series: [
      //   {
      //     name: 'Direct',
      //     type: 'bar',
      //     stack: 'total',
      //     label: {
      //       show: true,
      //     },
      //     emphasis: {
      //       focus: 'series',
      //     },
      //     data: [320, 302, 301, 334, 390, 330, 320],
      //   },
      //   {
      //     name: 'Mail Ad',
      //     type: 'bar',
      //     stack: 'total',
      //     label: {
      //       show: true,
      //     },
      //     emphasis: {
      //       focus: 'series',
      //     },
      //     data: [120, 132, 101, 134, 90, 230, 210],
      //   },
      //   {
      //     name: 'Affiliate Ad',
      //     type: 'bar',
      //     stack: 'total',
      //     label: {
      //       show: true,
      //     },
      //     emphasis: {
      //       focus: 'series',
      //     },
      //     data: [220, 182, 191, 234, 290, 330, 310],
      //   },
      //   {
      //     name: 'Video Ad',
      //     type: 'bar',
      //     stack: 'total',
      //     label: {
      //       show: true,
      //     },
      //     emphasis: {
      //       focus: 'series',
      //     },
      //     data: [150, 212, 201, 154, 190, 330, 410],
      //   },
      //   {
      //     name: 'Search Engine',
      //     type: 'bar',
      //     stack: 'total',
      //     label: {
      //       show: true,
      //     },
      //     emphasis: {
      //       focus: 'series',
      //     },
      //     data: [820, 832, 901, 934, 1290, 1330, 1320],
      //   },
      // ],
    };
  }
  return <ReactECharts option={option} chartInstance={chartInstance} />;
}
