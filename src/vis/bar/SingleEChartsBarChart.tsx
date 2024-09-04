import { type ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';
import { ECharts } from 'echarts/core';
import round from 'lodash/round';
import uniq from 'lodash/uniq';
import * as React from 'react';
import { NAN_REPLACEMENT, VIS_NEUTRAL_COLOR } from '../general';
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
 * Creates a rectangular matrix from the series data.
 *
 * @param series - An array of objects representing bar series options, each with a `data` property.
 * @returns The rectangular matrix created from the series data.
 */
function createMatrix(series: (BarSeriesOption & { categories: string[] })[]) {
  // Create a rectangular matrix from the series data
  const matrix = series.map((item) => item.data);
  return matrix;
}

/**
 * Sorts a matrix of bar series data based on a specified order.
 *
 * @param matrix - The matrix of bar series data.
 * @param series - The array of bar series options.
 * @param order - The order in which to sort the data.
 * @returns An object containing the sorted matrix and the corresponding categories.
 */
function matrixSort(matrix: BarSeriesOption['data'][], series: (BarSeriesOption & { categories: string[] })[], order: EBarSortState = EBarSortState.NONE) {
  const { categories } = series[0];
  const numCategories = categories.length;

  // Create a square matrix with dimensions equal to the number of categories
  const squareMatrix = Array.from({ length: numCategories }, () => Array(numCategories).fill(0)) as number[][];

  // Sum the values for each category across all series
  for (let i = 0; i < numCategories; i++) {
    for (let j = 0; j < series.length; j++) {
      squareMatrix[i][i] += series[j].data[i] as number;
    }
  }

  // Flatten the square matrix and remove 0 values
  const flattenedData = squareMatrix.reduce((acc, val) => acc.concat(val), []).filter((val) => val !== 0);

  // Sort the flattened array based on the order parameter
  if (order === EBarSortState.ASCENDING) {
    flattenedData.sort((a, b) => a - b);
  } else if (order === EBarSortState.DESCENDING) {
    flattenedData.sort((a, b) => b - a);
  }

  // Ensure "Unknown" category is placed last
  const unknownIndex = categories.indexOf('Unknown');
  if (unknownIndex !== -1) {
    const unknownValue = squareMatrix[unknownIndex][unknownIndex];
    flattenedData.splice(flattenedData.indexOf(unknownValue), 1);
    flattenedData.push(unknownValue);
  }

  // Create a new sorted matrix initialized with null values
  const sortedMatrix = Array.from({ length: numCategories }, () => Array(numCategories).fill(0)) as number[][];

  // Populate the diagonal of the new matrix with the sorted values
  for (let i = 0; i < flattenedData.length; i++) {
    sortedMatrix[i][i] = flattenedData[i];
  }

  // Create a new categories array that corresponds to the sorted data values
  const sortedCategories = [];
  for (let i = 0; i < numCategories; i++) {
    for (let j = 0; j < numCategories; j++) {
      if (squareMatrix[j][j] === sortedMatrix[i][i]) {
        sortedCategories.push(categories[j]);
        break;
      }
    }
  }

  return { sortedMatrix, sortedCategories };
}

/**
 * Sorts and restores the matrix of a bar chart series based on the specified order.
 *
 * @param series - The bar chart series to sort and restore.
 * @param order - The order in which to sort the matrix. Defaults to EBarSortState.NONE.
 * @returns The sorted and restored series.
 */
function sortAndRestoreMatrix(series: (BarSeriesOption & { categories: string[] })[], order: EBarSortState = EBarSortState.NONE) {
  // Create the initial matrix
  const matrix = createMatrix(series);

  // Sort the matrix and update categories
  const { sortedCategories } = matrixSort(matrix, series, order);

  const sortedSeries = series.map((item) => {
    const transformedData = sortedCategories.map((category) => {
      const index = item.categories.indexOf(category);
      return item.data[index];
    });
    return {
      categories: sortedCategories,
      data: transformedData,
    };
  });

  return sortedSeries;
}

const VERTICAL_BAR_CHART_HEIGHT = 250;

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
  const [sortState, setSortState] = React.useState<SortState>({ x: EBarSortState.NONE, y: EBarSortState.NONE });

  const [series, setSeries] = React.useState<BarSeriesOption[]>([]);
  const [option, setOption] = React.useState<ReactEChartsProps['option']>(null);
  const [axes, setAxes] = React.useState<{ xAxis: ReactEChartsProps['option']['xAxis']; yAxis: ReactEChartsProps['option']['yAxis'] }>({
    xAxis: null,
    yAxis: null,
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

        catColumnSelected: config.catColumnSelected,
        group: config.group,
      }) as BarSeriesOption,
    [config.catColumnSelected, config.display, config.group, config.groupType],
  );

  const optionBase: ReactEChartsProps['option'] = React.useMemo(
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
      }) as ReactEChartsProps['option'],
    [calculateChartHeight, selectedFacetValue],
  );

  const updateSortSideEffect = React.useCallback(
    ({ barSeries = [] }: { barSeries: (BarSeriesOption & { categories: string[] })[] }) => {
      if (config.direction === EBarDirection.HORIZONTAL) {
        const sortedSeries = sortAndRestoreMatrix(barSeries, sortState.x);
        setSeries(barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex].data })));
        setAxes((a) => ({ ...a, yAxis: { ...a.yAxis, data: sortedSeries[0].categories } }));
      }
      if (config.direction === EBarDirection.VERTICAL) {
        const sortedSeries = sortAndRestoreMatrix(
          barSeries,
          sortState.y === EBarSortState.ASCENDING
            ? EBarSortState.DESCENDING
            : sortState.y === EBarSortState.DESCENDING
              ? EBarSortState.ASCENDING
              : EBarSortState.NONE,
        );
        setSeries(barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex].data })));
        setAxes((a) => ({ ...a, xAxis: { ...a.xAxis, data: sortedSeries[0].categories } }));
      }
    },
    [config.direction, sortState.x, sortState.y],
  );

  const chartInstance = React.useCallback(
    (chart: ECharts) => {
      // remove all listeners to avoid memory leaks and multiple listeners
      chart.off('click');
      // register EChart listerners to chartInstance
      // NOTE: @dv-usama-ansari: Using queries to attach event listeners: https://echarts.apache.org/en/api.html#events
      chart.on('click', { titleIndex: 0 }, () => {
        setConfig({ ...config, focusFacetIndex: config.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
      });

      chart.on('click', { seriesType: 'bar' }, (params) => {
        const event = params.event.event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>;
        const ids = filteredDataTable
          .filter((item) => item.category === params.name && (!config.group || (config.group && item.group === params.seriesName)))
          .map((item) => item.id);
        if (event.shiftKey) {
          selectionCallback(event, [...new Set([...selectedList, ...ids])]);
        } else {
          selectionCallback(event, ids);
        }
      });
    },
    [config, filteredDataTable, selectedFacetIndex, selectedList, selectionCallback, setConfig],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    if (config.direction === EBarDirection.HORIZONTAL) {
      setAxes((a) => ({
        ...a,
        xAxis: { type: 'value' as const },
        yAxis: {
          ...a.yAxis,
          type: 'category' as const,
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
    if (config.direction === EBarDirection.VERTICAL) {
      setAxes((a) => ({
        ...a,
        xAxis: {
          ...a.xAxis,
          type: 'category' as const,
          axisLabel: {
            show: true,
            formatter: (value) => {
              return value.length > AXIS_LABEL_MAX_LENGTH ? `${value.slice(0, AXIS_LABEL_MAX_LENGTH)}...` : value;
            },
            // TODO: add tooltip for truncated labels (@see https://github.com/apache/echarts/issues/19616 and workaround https://codepen.io/plainheart/pen/jOGBrmJ)
          },
        },
        yAxis: { type: 'value' as const },
      }));
    }
  }, [config.direction]);

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

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the data changes.
  React.useEffect(() => {
    setOption((o) => {
      let options = { ...o, ...optionBase };
      if (series) {
        options = { ...options, series };
      }
      if (axes.xAxis) {
        options = { ...options, xAxis: axes.xAxis };
      }
      if (axes.yAxis) {
        options = { ...options, yAxis: axes.yAxis };
      }
      return options;
    });
  }, [axes.xAxis, axes.yAxis, optionBase, series]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the direction of the bar chart changes.
  React.useEffect(() => {
    updateDirectionSideEffect();
  }, [config.direction, updateDirectionSideEffect]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the selected categorical column changes.
  React.useEffect(() => {
    updateCategoriesSideEffect();
  }, [updateCategoriesSideEffect]);

  React.useEffect(() => {
    if (config.display === EBarDisplayType.NORMALIZED) {
      setSortState({ x: EBarSortState.NONE, y: EBarSortState.NONE });
    } else if (config.sortState) {
      setSortState({ x: config.sortState.x, y: config.sortState.y });
    }
  }, [config.display, config.sortState, config.sortState?.x, config.sortState?.y]);

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
