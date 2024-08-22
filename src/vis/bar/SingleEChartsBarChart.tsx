import type { ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';
import { ECharts } from 'echarts/core';
import { round, uniq } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VIS_NEUTRAL_COLOR } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, IBarDataTableRow } from './interfaces';
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

type SortState = { x: 'none' | 'asc' | 'desc'; y: 'none' | 'asc' | 'desc' };

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
  // console.log(config, dataTable, selectedFacetValue);
  const [sortState, setSortState] = useState<SortState>({ x: 'none', y: 'none' });
  const [filteredDataTable, setFilteredDataTable] = useState(selectedFacetValue ? dataTable.filter((item) => item.facet === selectedFacetValue) : dataTable);

  // console.log('filteredDataTable', filteredDataTable);

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

  console.log('aggregatedData', aggregatedData, categories, groupings, hasSelected);

  /**
   * Calculates and returns the rounded absolute or normalized value, dependending on the config value.
   * Enabled grouping always returns the absolute value. The normalized value is only calculated for stacked bars.
   * @param value Absolute value
   * @param total Number of values in the category
   * @returns Returns the rounded absolute value. Otherwise returns the rounded normalized value.
   */
  const normalizedValue = useCallback(
    (value, total) => {
      return config.group && config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED
        ? round((value / total) * 100, 2)
        : round(value, 4);
    },
    [config.display, config.group, config.groupType],
  );

  // prepare data
  const baseSeries = useMemo(
    () =>
      groupings
        .map((group) => {
          return ['selected', 'unselected'].map((selected) => {
            let data = [];

            switch (config.aggregateType) {
              case EAggregateTypes.COUNT:
                data = categories.map((cat) =>
                  aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(aggregatedData[cat][group][selected].count, aggregatedData[cat].total) : 0,
                );
                break;

              case EAggregateTypes.AVG:
                data = categories.map((cat) =>
                  aggregatedData[cat]?.[group]?.[selected]
                    ? normalizedValue(aggregatedData[cat][group][selected].sum / aggregatedData[cat][group][selected].count, aggregatedData[cat].total)
                    : 0,
                );
                break;

              case EAggregateTypes.MIN:
                data = categories.map((cat) =>
                  aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(aggregatedData[cat][group][selected].min, aggregatedData[cat].total) : 0,
                );
                break;

              case EAggregateTypes.MAX:
                data = categories.map((cat) =>
                  aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(aggregatedData[cat][group][selected].max, aggregatedData[cat].total) : 0,
                );
                break;

              case EAggregateTypes.MED:
                data = categories.map((cat) =>
                  aggregatedData[cat]?.[group]?.[selected] ? normalizedValue(median(aggregatedData[cat][group][selected].nums), aggregatedData[cat].total) : 0,
                );
                break;

              default:
                console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
                break;
            }

            // avoid rendering empty series (bars for a group with all 0 values)
            if (data.every((d) => d === 0 || Number.isNaN(d))) {
              return null;
            }

            return {
              type: 'bar',
              triggerEvent: true, // enable click events on bars -> handled by chartInstance callback
              name: groupings.length > 1 ? group : null,
              stack: config.groupType === EBarGroupingType.STACK ? 'total' : group, // group = individual group names, stack = any fixed name
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
                color: config.group && groupColorScale ? groupColorScale(group) || VIS_NEUTRAL_COLOR : VIS_NEUTRAL_COLOR,
                opacity: hasSelected ? (selected === 'selected' ? 1 : 0.5) : 1, // reduce opacity for unselected bars if there are selected items
              },
              data: data.map((d) => (d === 0 ? null : d)) as number[],
            };
          });
        })
        .filter((item) => item != null) // remove the empty series here
        .flat() as BarSeriesOption[], // flatten the array to a get a list of series
    [
      aggregatedData,
      categories,
      config.aggregateType,
      config.display,
      config.group,
      config.groupType,
      groupColorScale,
      groupings,
      hasSelected,
      normalizedValue,
    ],
  );
  const [series, setSeries] = useState<BarSeriesOption[]>();

  const handleSort = useCallback(
    (axis: 'x' | 'y') => {
      setSortState((prevSortState) => {
        const newSortState = { ...prevSortState };
        if (config.direction === EBarDirection.HORIZONTAL) {
          if (axis === 'x') {
            newSortState.x = prevSortState.x === 'none' ? 'asc' : prevSortState.x === 'asc' ? 'desc' : 'none';
            newSortState.y = 'none';
          } else if (axis === 'y') {
            newSortState.x = prevSortState.x;
            newSortState.y = 'none';
          }
        } else if (config.direction === EBarDirection.VERTICAL) {
          if (axis === 'x') {
            newSortState.x = 'none';
            newSortState.y = prevSortState.y;
          } else if (axis === 'y') {
            newSortState.x = 'none';
            newSortState.y = prevSortState.y === 'none' ? 'asc' : prevSortState.y === 'asc' ? 'desc' : 'none';
          }
        }
        return newSortState;
      });
    },
    [config.direction],
  );

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
      });
      chart.on('click', { titleIndex: 2 }, () => {
        handleSort('y');
      });
      chart.on('click', { seriesType: 'bar' }, ({ componentType, event, seriesName, name, ...rest }) => {
        selectionCallback(
          event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>,
          filteredDataTable.filter((item) => item.category === name && (!config.group || (config.group && item.group === seriesName))).map((item) => item.id),
        );
      });
    },
    [config, filteredDataTable, handleSort, selectedFacetIndex, selectionCallback, setConfig],
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

  const baseOption: ReactEChartsProps['option'] = useMemo(
    () => ({
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
        config.direction === EBarDirection.HORIZONTAL
          ? {
              text: 'Sort along X-axis',
              name: 'sortXAxis',
              left: '50%',
              top: '90%',
              textStyle: {
                fontSize: 14,
                color: '#000',
              },
              triggerEvent: true,
            }
          : null,
        config.direction === EBarDirection.VERTICAL
          ? {
              text: 'Sort along Y-axis',
              name: 'sortYAxis',
              left: '5%',
              top: '50%',
              textStyle: {
                fontSize: 14,
                color: '#000',
              },
              triggerEvent: true,
            }
          : null,
      ].filter(Boolean),
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      legend: {},
      series,
    }),
    [calculateChartHeight, config.direction, selectedFacetValue, series],
  );

  const [option, setOption] = useState(null);

  useEffect(() => {
    setSeries(baseSeries);

    switch (sortState.x) {
      case 'asc':
        setSeries((prev) =>
          prev.map((item) => {
            return !item
              ? null
              : {
                  ...item,
                  data: (item.data as number[]).sort((a, b) => a - b),
                };
          }),
        );
        break;
      case 'desc':
        setSeries((prev) =>
          prev.map((item) => {
            return !item
              ? null
              : {
                  ...item,
                  data: (item.data as number[]).sort((a, b) => b - a),
                };
          }),
        );
        break;
      default:
        setSeries(baseSeries);
        break;
    }

    switch (sortState.y) {
      case 'asc':
        setSeries((prev) =>
          prev.map((item) => {
            return !item
              ? null
              : {
                  ...item,
                  data: (item.data as number[]).sort((a, b) => a - b),
                };
          }),
        );
        break;
      case 'desc':
        setSeries((prev) =>
          prev.map((item) => {
            return !item
              ? null
              : {
                  ...item,
                  data: (item.data as number[]).sort((a, b) => b - a),
                };
          }),
        );
        break;
      default:
        break;
    }
  }, [baseSeries, sortState.x, sortState.y]);

  useEffect(() => {
    setOption(baseOption);

    if (config.direction === EBarDirection.VERTICAL) {
      setOption((o) => ({
        ...o,
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            show: true,
            formatter: (value) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            // TODO: add tooltip for truncated labels (@see https://github.com/apache/echarts/issues/19616 and workaround https://codepen.io/plainheart/pen/jOGBrmJ)
          },
        },
        yAxis: {
          type: 'value',
        },
      }));
    } else {
      setOption((o) => ({
        ...o,
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            show: true,
            formatter: (value) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            // TODO: add tooltip for truncated labels (@see https://github.com/apache/echarts/issues/19616 and workaround https://codepen.io/plainheart/pen/jOGBrmJ)
          },
        },
      }));
    }
  }, [baseOption, categories, config.direction]);

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
