import { Box, Center, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues } from 'd3v7';
import groupBy from 'lodash/groupBy';
import round from 'lodash/round';
import sort from 'lodash/sortBy';
import sortedUniq from 'lodash/sortedUniq';
import uniqueId from 'lodash/uniqueId';
import zipWith from 'lodash/zipWith';
import React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors as colorScale } from '../../utils/colors';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { getLabelOrUnknown } from '../general/utils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisProps, VisNumericalValue } from '../interfaces';
import { BarChartSortButton, EBarSortParameters } from './BarChartSortButton';
import { AggregatedDataType, median, SingleEChartsBarChart } from './SingleEChartsBarChart';
import { FocusFacetSelector } from './barComponents/FocusFacetSelector';
import { BAR_SPACING, BAR_WIDTH, CHART_HEIGHT_MARGIN, DEFAULT_BAR_CHART_HEIGHT, DEFAULT_BAR_CHART_MIN_WIDTH, VERTICAL_BAR_CHART_HEIGHT } from './constants';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, IBarDataTableRow } from './interfaces';
import { createBinLookup, getBarData } from './utils';

const DEFAULT_FACET_NAME = '$default$';

function calculateChartMinWidth({ config, aggregatedData }: { config?: IBarConfig; aggregatedData?: AggregatedDataType }): number {
  if (config?.direction === EBarDirection.VERTICAL) {
    // calculate height for horizontal bars
    const multiplicationFactor = !config?.group ? 1 : config?.groupType === EBarGroupingType.STACK ? 1 : (aggregatedData?.groupingsList ?? []).length;
    const categoryWidth = (BAR_WIDTH + BAR_SPACING) * multiplicationFactor;
    return (aggregatedData?.categoriesList ?? []).length * categoryWidth + 2 * BAR_SPACING;
  }
  if (config?.direction === EBarDirection.HORIZONTAL) {
    // use fixed height for vertical bars

    return DEFAULT_BAR_CHART_MIN_WIDTH;
  }
  return DEFAULT_BAR_CHART_MIN_WIDTH;
}

function calculateChartHeight({
  config,
  aggregatedData,
  containerHeight,
}: {
  config?: IBarConfig;
  aggregatedData?: AggregatedDataType;
  containerHeight: number;
}): number {
  if (config?.direction === EBarDirection.HORIZONTAL) {
    // calculate height for horizontal bars
    const multiplicationFactor = !config?.group ? 1 : config?.groupType === EBarGroupingType.STACK ? 1 : (aggregatedData?.groupingsList ?? []).length;
    const categoryWidth = (BAR_WIDTH + BAR_SPACING) * multiplicationFactor;
    return (aggregatedData?.categoriesList ?? []).length * categoryWidth + 2 * BAR_SPACING;
  }
  if (config?.direction === EBarDirection.VERTICAL) {
    // use fixed height for vertical bars
    if (!config?.facets && config?.useFullHeight) {
      return containerHeight - CHART_HEIGHT_MARGIN;
    }
    return VERTICAL_BAR_CHART_HEIGHT;
  }
  return DEFAULT_BAR_CHART_HEIGHT;
}

function getAggregatedDataMap(config: IBarConfig, dataTable: IBarDataTableRow[], selectedMap: ICommonVisProps<IBarConfig>['selectedMap']) {
  const facetGrouped = config.facets ? groupBy(dataTable, 'facet') : { [DEFAULT_FACET_NAME]: dataTable };
  const aggregated: { facets: { [facet: string]: AggregatedDataType }; globalDomain: { min: number; max: number } } = {
    facets: {},
    globalDomain: { min: Infinity, max: -Infinity },
  };
  const minMax: { facets: { [facet: string]: AggregatedDataType } } = { facets: {} };
  Object.keys(facetGrouped).forEach((facet) => {
    const values = facetGrouped[facet];
    const facetSensitiveDataTable = facet === DEFAULT_FACET_NAME ? dataTable : dataTable.filter((item) => item.facet === facet);
    const categoriesList = sortedUniq(sort(facetSensitiveDataTable.map((item) => item.category) ?? []));
    const groupingsList = sortedUniq(sort(facetSensitiveDataTable.map((item) => item.group) ?? []));
    (values ?? []).forEach((item) => {
      const { category, agg, group } = item;
      const selected = selectedMap?.[item.id] || false;
      if (!aggregated.facets[facet]) {
        aggregated.facets[facet] = { categoriesList, groupingsList, categories: {} };
      }
      if (!aggregated.facets[facet].categories[category]) {
        aggregated.facets[facet].categories[category] = { total: 0, ids: [], groups: {} };
      }
      if (!aggregated.facets[facet].categories[category].groups[group]) {
        aggregated.facets[facet].categories[category].groups[group] = {
          total: 0,
          ids: [],
          selected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
          unselected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
        };
      }

      // update category values
      aggregated.facets[facet].categories[category].total++;
      aggregated.facets[facet].categories[category].ids.push(item.id);
      aggregated.facets[facet].categories[category].groups[group].total++;
      aggregated.facets[facet].categories[category].groups[group].ids.push(item.id);

      // update group values
      if (selected) {
        aggregated.facets[facet].categories[category].groups[group].selected.count++;
        aggregated.facets[facet].categories[category].groups[group].selected.sum += agg || 0;
        aggregated.facets[facet].categories[category].groups[group].selected.nums.push(agg || 0);
        aggregated.facets[facet].categories[category].groups[group].selected.ids.push(item.id);
      } else {
        aggregated.facets[facet].categories[category].groups[group].unselected.count++;
        aggregated.facets[facet].categories[category].groups[group].unselected.sum += agg || 0;
        aggregated.facets[facet].categories[category].groups[group].unselected.nums.push(agg || 0);
        aggregated.facets[facet].categories[category].groups[group].unselected.ids.push(item.id);
      }

      if (!minMax.facets[facet]) {
        minMax.facets[facet] = { categoriesList: [], groupingsList: [], categories: {} };
      }
      if (!minMax.facets[facet].categories[category]) {
        minMax.facets[facet].categories[category] = { total: 0, ids: [], groups: {} };
      }
      if (!minMax.facets[facet].categories[category].groups[group]) {
        minMax.facets[facet].categories[category].groups[group] = {
          total: 0,
          ids: [],
          selected: { count: 0, sum: 0, nums: [], ids: [], min: Infinity, max: -Infinity },
          unselected: { count: 0, sum: 0, nums: [], ids: [], min: Infinity, max: -Infinity },
        };
      }

      if (selected) {
        minMax.facets[facet].categories[category].groups[group].selected.min = Math.min(
          minMax.facets[facet].categories[category].groups[group].selected.min,
          agg || Infinity,
        );
        minMax.facets[facet].categories[category].groups[group].selected.max = Math.max(
          minMax.facets[facet].categories[category].groups[group].selected.max,
          agg || -Infinity,
        );
      } else {
        minMax.facets[facet].categories[category].groups[group].unselected.min = Math.min(
          minMax.facets[facet].categories[category].groups[group].unselected.min,
          agg || Infinity,
        );
        minMax.facets[facet].categories[category].groups[group].unselected.max = Math.max(
          minMax.facets[facet].categories[category].groups[group].unselected.max,
          agg || -Infinity,
        );
      }
    });
    (values ?? []).forEach((item) => {
      const { category, group } = item;
      if (aggregated.facets[facet]?.categories[category]?.groups[group] && minMax.facets[facet]?.categories[category]?.groups[group]) {
        aggregated.facets[facet].categories[category].groups[group].selected.min = minMax.facets[facet].categories[category].groups[group].selected.min;
        aggregated.facets[facet].categories[category].groups[group].selected.max = minMax.facets[facet].categories[category].groups[group].selected.max;
        aggregated.facets[facet].categories[category].groups[group].unselected.min = minMax.facets[facet].categories[category].groups[group].unselected.min;
        aggregated.facets[facet].categories[category].groups[group].unselected.max = minMax.facets[facet].categories[category].groups[group].unselected.max;
      }
    });
  });

  Object.keys(aggregated.facets).forEach((facet) => {
    Object.keys(aggregated.facets[facet]?.categories ?? {}).forEach((category) => {
      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).forEach((group) => {
        if (config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED) {
          aggregated.globalDomain.min = 0;
          aggregated.globalDomain.max = 100;
        } else {
          switch (config.aggregateType) {
            case EAggregateTypes.COUNT:
              aggregated.globalDomain.max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(aggregated.facets[facet]?.categories[category]?.total ?? -Infinity, aggregated.globalDomain.max)
                  : Math.max(aggregated.facets[facet]?.categories[category]?.groups[group]?.total ?? -Infinity, aggregated.globalDomain.max);
              aggregated.globalDomain.min =
                config.groupType === EBarGroupingType.STACK
                  ? Math.min(aggregated.facets[facet]?.categories[category]?.total ?? Infinity, aggregated.globalDomain.min, 0)
                  : Math.min(aggregated.facets[facet]?.categories[category]?.groups[group]?.total ?? Infinity, aggregated.globalDomain.min, 0);
              break;

            case EAggregateTypes.AVG:
              aggregated.globalDomain.max =
                config.groupType === EBarGroupingType.STACK
                  ? round(
                      Math.max(
                        Math.max(
                          Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce(
                            (acc, key) =>
                              acc +
                              (aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.sum ?? -Infinity) /
                                (aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.count || 1),
                            0,
                          ),
                          Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce(
                            (acc, key) =>
                              acc +
                              (aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.sum ?? -Infinity) /
                                (aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.count || 1),
                            0,
                          ),
                        ),
                        aggregated.globalDomain.max,
                      ),
                      4,
                    )
                  : round(
                      Math.max(
                        Math.max(
                          (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.sum ?? -Infinity) /
                            (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.count || 1),
                          (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.sum ?? -Infinity) /
                            (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.count || 1),
                        ),
                        aggregated.globalDomain.max,
                      ),
                      4,
                    );
              aggregated.globalDomain.min = round(
                Math.min(
                  Math.min(
                    (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.sum ?? Infinity) /
                      (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.count || 1),
                    (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.sum ?? Infinity) /
                      (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.count || 1),
                  ),
                  aggregated.globalDomain.min,
                  0,
                ),
                4,
              );
              break;

            case EAggregateTypes.MIN:
              aggregated.globalDomain.max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce((acc, key) => {
                        const selectedMin = aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.min ?? 0;
                        const infiniteSafeSelectedMin = selectedMin === Infinity ? 0 : selectedMin;
                        const unselectedMin = aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.min ?? 0;
                        const infiniteSafeUnselectedMin = unselectedMin === Infinity ? 0 : unselectedMin;
                        return acc + infiniteSafeSelectedMin + infiniteSafeUnselectedMin;
                      }, 0),

                      aggregated.globalDomain.max,
                    )
                  : Math.max(
                      Math.min(
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.min ?? Infinity,
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.min ?? Infinity,
                      ),
                      aggregated.globalDomain.max,
                    );
              aggregated.globalDomain.min = Math.min(
                Math.min(
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.min ?? Infinity,
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.min ?? Infinity,
                ),
                aggregated.globalDomain.min,
                0,
              );
              break;

            case EAggregateTypes.MAX:
              aggregated.globalDomain.max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce((acc, key) => {
                        const selectedMax = aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.max ?? 0;
                        const infiniteSafeSelectedMax = selectedMax === -Infinity ? 0 : selectedMax;
                        const unselectedMax = aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.max ?? 0;
                        const infiniteSafeUnselectedMax = unselectedMax === -Infinity ? 0 : unselectedMax;
                        return acc + infiniteSafeSelectedMax + infiniteSafeUnselectedMax;
                      }, 0),
                      aggregated.globalDomain.max,
                    )
                  : Math.max(
                      Math.max(
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.max ?? -Infinity,
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.max ?? -Infinity,
                      ),
                      aggregated.globalDomain.max,
                    );
              aggregated.globalDomain.min = Math.min(
                Math.max(
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.max ?? -Infinity,
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.max ?? -Infinity,
                ),
                aggregated.globalDomain.min,
                0,
              );
              break;

            case EAggregateTypes.MED: {
              const selectedMedian = median(aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.nums ?? []);
              const unselectedMedian = median(aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.nums ?? []);
              aggregated.globalDomain.max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce((acc, key) => {
                        const selectedStackMedian = median(aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.nums ?? []) ?? 0;
                        const unselectedStackMedian = median(aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.nums ?? []) ?? 0;
                        return acc + selectedStackMedian + unselectedStackMedian;
                      }, 0),
                    )
                  : Math.max(Math.max(selectedMedian ?? -Infinity, unselectedMedian ?? -Infinity), aggregated.globalDomain.max);
              aggregated.globalDomain.min = Math.min(Math.min(selectedMedian ?? Infinity, unselectedMedian ?? Infinity), aggregated.globalDomain.min, 0);
              break;
            }

            default:
              console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
              break;
          }
        }
      });
    });
  });
  return aggregated;
}

export function BarChart({
  config,
  setConfig,
  columns,
  selectedMap,
  selectedList,
  selectionCallback,
  uniquePlotId,
  showDownloadScreenshot,
}: Pick<
  ICommonVisProps<IBarConfig>,
  'config' | 'setConfig' | 'columns' | 'selectedMap' | 'selectedList' | 'selectionCallback' | 'uniquePlotId' | 'showDownloadScreenshot'
>) {
  const { ref: resizeObserverRef, width: containerWidth, height: containerHeight } = useElementSize();
  const id = React.useMemo(() => uniquePlotId || uniqueId('BarChartVis'), [uniquePlotId]);

  const listRef = React.useRef<VariableSizeList>(null);

  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [
    columns,
    config?.catColumnSelected as ColumnInfo,
    config?.group as ColumnInfo,
    config?.facets as ColumnInfo,
    config?.aggregateColumn as ColumnInfo,
  ]);

  const [gridLeft, setGridLeft] = React.useState(containerWidth / 3);

  const truncatedTextRef = React.useRef<{ labels: { [value: string]: string }; longestLabelWidth: number; containerWidth: number }>({
    labels: {},
    longestLabelWidth: 0,
    containerWidth,
  });
  const [labelsMap, setLabelsMap] = React.useState<Record<string, string>>({});

  const dataTable = React.useMemo(() => {
    if (!allColumns) {
      return [];
    }

    // bin the `group` column values if a numerical column is selected
    const binLookup: Map<VisNumericalValue, string> | null =
      allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? createBinLookup(allColumns.groupColVals?.resolvedValues as VisNumericalValue[]) : null;

    return zipWith(
      allColumns.catColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.aggregateColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.groupColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.facetsColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
      (cat, agg, group, facet) => {
        return {
          id: cat.id,
          category: getLabelOrUnknown(cat?.val),
          agg: agg?.val as number,
          // if the group column is numerical, use the bin lookup to get the bin name, otherwise use the label or 'unknown'
          group: typeof group?.val === 'number' ? (binLookup?.get(group as VisNumericalValue) as string) : getLabelOrUnknown(group?.val),
          facet: getLabelOrUnknown(facet?.val),
        };
      },
    );
  }, [allColumns]);

  const aggregatedDataMap = React.useMemo(() => (config ? getAggregatedDataMap(config!, dataTable, selectedMap) : null), [config, dataTable, selectedMap]);

  const groupColorScale = React.useMemo(() => {
    if (!allColumns?.groupColVals) {
      return null;
    }

    const groups = Array.from(new Set(dataTable.map((row) => row.group)));
    const range =
      allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? (schemeBlues[Math.max(groups.length - 1, 3)] as string[]) // use at least 3 colors for numerical values
        : groups.map(
            (group, i) => (allColumns?.groupColVals?.color?.[group] || colorScale[i % colorScale.length]) as string, // use the custom color from the column if available, otherwise use the default color scale
          );

    return scaleOrdinal<string>().domain(groups).range(range);
  }, [allColumns?.groupColVals, dataTable]);

  const allUniqueFacetVals = React.useMemo(() => {
    return [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => getLabelOrUnknown(v.val)))] as string[];
  }, [allColumns?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = React.useMemo(() => {
    return typeof config?.focusFacetIndex === 'number' && config?.focusFacetIndex < allUniqueFacetVals.length
      ? [allUniqueFacetVals[config?.focusFacetIndex]]
      : allUniqueFacetVals;
  }, [allUniqueFacetVals, config?.focusFacetIndex]);

  const customSelectionCallback = React.useCallback(
    (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => {
      if (selectionCallback) {
        if (e.ctrlKey) {
          selectionCallback([...new Set([...(selectedList ?? []), ...ids])]);
          return;
        }
        if ((selectedList ?? []).length === ids.length && (selectedList ?? []).every((value, index) => value === ids[index])) {
          selectionCallback([]);
        } else {
          selectionCallback(ids);
        }
      }
    },
    [selectedList, selectionCallback],
  );

  const chartHeightMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(aggregatedDataMap?.facets ?? {}).forEach(([facet, value]) => {
      if (facet) {
        map[facet] = calculateChartHeight({ config, aggregatedData: value, containerHeight });
      }
    });
    return map;
  }, [aggregatedDataMap?.facets, config, containerHeight]);

  const chartMinWidthMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(aggregatedDataMap?.facets ?? {}).forEach(([facet, value]) => {
      if (facet) {
        map[facet] = calculateChartMinWidth({ config, aggregatedData: value });
      }
    });
    return map;
  }, [aggregatedDataMap?.facets, config]);

  const isGroupedByNumerical = React.useMemo(() => allColumns?.groupColVals?.type === EColumnTypes.NUMERICAL, [allColumns?.groupColVals?.type]);

  const itemData = React.useMemo(
    () => ({
      aggregatedDataMap,
      allUniqueFacetVals,
      chartHeightMap,
      chartMinWidthMap,
      config,
      containerHeight,
      containerWidth,
      filteredUniqueFacetVals,
      groupColorScale,
      isGroupedByNumerical,
      labelsMap,
      longestLabelWidth: truncatedTextRef.current.longestLabelWidth,
      selectedList,
      selectedMap,
      customSelectionCallback,
      setConfig,
    }),
    [
      aggregatedDataMap,
      allUniqueFacetVals,
      chartHeightMap,
      chartMinWidthMap,
      config,
      containerHeight,
      containerWidth,
      customSelectionCallback,
      filteredUniqueFacetVals,
      groupColorScale,
      isGroupedByNumerical,
      labelsMap,
      selectedList,
      selectedMap,
      setConfig,
    ],
  );

  const handleScroll = React.useCallback(({ y }: { y: number }) => {
    listRef.current?.scrollTo(y);
  }, []);

  const Row = React.useCallback((props: ListChildComponentProps<typeof itemData>) => {
    const multiplesVal = props.data.filteredUniqueFacetVals?.[props.index];

    return (
      <Box component="div" style={{ ...props.style, padding: '10px 0px' }}>
        <SingleEChartsBarChart
          aggregatedData={props.data.aggregatedDataMap?.facets[multiplesVal as string] as AggregatedDataType}
          chartHeight={props.data.chartHeightMap[multiplesVal as string] ?? DEFAULT_BAR_CHART_HEIGHT}
          chartMinWidth={props.data.chartMinWidthMap[multiplesVal as string] ?? DEFAULT_BAR_CHART_MIN_WIDTH}
          containerWidth={props.data.containerWidth}
          config={props.data.config}
          globalMax={props.data.aggregatedDataMap?.globalDomain.max}
          globalMin={props.data.aggregatedDataMap?.globalDomain.min}
          groupColorScale={props.data.groupColorScale!}
          isGroupedByNumerical={props.data.isGroupedByNumerical}
          labelsMap={props.data.labelsMap}
          longestLabelWidth={props.data.longestLabelWidth}
          selectedFacetIndex={multiplesVal ? props.data.allUniqueFacetVals.indexOf(multiplesVal) : undefined} // use the index of the original list to return back to the grid
          selectedFacetValue={multiplesVal}
          selectedList={props.data.selectedList}
          selectedMap={props.data.selectedMap}
          selectionCallback={props.data.customSelectionCallback}
          setConfig={props.data.setConfig}
        />
      </Box>
    );
  }, []);

  const getTruncatedText = React.useCallback(
    (value: string) => {
      // NOTE: @dv-usama-ansari: This might be a performance bottleneck if the number of labels is very high and/or the parentWidth changes frequently (when the viewport is resized).
      if (containerWidth === truncatedTextRef.current.containerWidth && truncatedTextRef.current.labels[value] !== undefined) {
        return truncatedTextRef.current.labels[value];
      }

      const textEl = document.createElement('p');
      textEl.style.position = 'absolute';
      textEl.style.visibility = 'hidden';
      textEl.style.whiteSpace = 'nowrap';
      textEl.style.maxWidth = config?.direction === EBarDirection.HORIZONTAL ? `${Math.max(gridLeft, containerWidth / 3) - 20}px` : '70px';
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
    [config?.direction, containerWidth, gridLeft],
  );

  // NOTE: @dv-usama-ansari: We might need an optimization here.
  React.useEffect(() => {
    setLabelsMap({});
    Object.values(aggregatedDataMap?.facets ?? {}).forEach((value) => {
      (value?.categoriesList ?? []).forEach((category) => {
        const truncatedText = getTruncatedText(category);
        truncatedTextRef.current.labels[category] = truncatedText;
        setLabelsMap((prev) => ({ ...prev, [category]: truncatedText }));
      });
    });
    setGridLeft(Math.min(containerWidth / 3, truncatedTextRef.current.longestLabelWidth + 20));
  }, [containerWidth, getTruncatedText, config, aggregatedDataMap?.facets]);

  React.useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [config, dataTable]);

  return (
    <Stack data-testid="vis-bar-chart-container" flex={1} style={{ width: '100%', height: '100%' }} ref={resizeObserverRef}>
      {showDownloadScreenshot || config?.showFocusFacetSelector === true ? (
        <Group justify="center">
          {config?.showFocusFacetSelector === true ? <FocusFacetSelector config={config} setConfig={setConfig} facets={allUniqueFacetVals} /> : null}
          {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config!} /> : null}
          {config?.display !== EBarDisplayType.NORMALIZED ? (
            <BarChartSortButton
              config={config!}
              setConfig={setConfig!}
              sort={
                config?.direction === EBarDirection.HORIZONTAL
                  ? EBarSortParameters.AGGREGATION
                  : config?.direction === EBarDirection.VERTICAL
                    ? EBarSortParameters.CATEGORIES
                    : null
              }
            />
          ) : null}
          {config?.display !== EBarDisplayType.NORMALIZED ? (
            <BarChartSortButton
              config={config!}
              setConfig={setConfig!}
              sort={
                config?.direction === EBarDirection.HORIZONTAL
                  ? EBarSortParameters.CATEGORIES
                  : config?.direction === EBarDirection.VERTICAL
                    ? EBarSortParameters.AGGREGATION
                    : null
              }
            />
          ) : null}
        </Group>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: containerHeight }}>
        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : !config?.facets || !allColumns?.facetsColVals ? (
          <ScrollArea
            style={{ width: '100%', height: containerHeight - CHART_HEIGHT_MARGIN / 2 }}
            scrollbars={config?.direction === EBarDirection.HORIZONTAL ? 'y' : 'x'}
          >
            <SingleEChartsBarChart
              config={config}
              aggregatedData={aggregatedDataMap?.facets[DEFAULT_FACET_NAME] as AggregatedDataType}
              chartHeight={calculateChartHeight({
                config,
                aggregatedData: aggregatedDataMap?.facets[DEFAULT_FACET_NAME],
                containerHeight: containerHeight - CHART_HEIGHT_MARGIN / 2,
              })}
              chartMinWidth={calculateChartMinWidth({ config, aggregatedData: aggregatedDataMap?.facets[DEFAULT_FACET_NAME] })}
              containerWidth={containerWidth}
              globalMin={aggregatedDataMap?.globalDomain.min}
              globalMax={aggregatedDataMap?.globalDomain.max}
              groupColorScale={groupColorScale!}
              isGroupedByNumerical={isGroupedByNumerical}
              labelsMap={labelsMap}
              longestLabelWidth={truncatedTextRef.current.longestLabelWidth}
              selectedList={selectedList}
              setConfig={setConfig}
              selectionCallback={customSelectionCallback}
              selectedMap={selectedMap}
            />
          </ScrollArea>
        ) : null}

        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : config?.facets && allColumns?.facetsColVals ? (
          // NOTE: @dv-usama-ansari: Referenced from https://codesandbox.io/p/sandbox/react-window-with-scrollarea-g9dg6d?file=%2Fsrc%2FApp.tsx%3A40%2C8
          <ScrollArea
            style={{ width: '100%', height: containerHeight - CHART_HEIGHT_MARGIN / 2 }}
            onScrollPositionChange={handleScroll}
            type="hover"
            scrollHideDelay={0}
          >
            <VariableSizeList
              height={containerHeight - CHART_HEIGHT_MARGIN / 2}
              itemCount={filteredUniqueFacetVals.length}
              itemData={itemData}
              itemSize={(index: number) => (chartHeightMap[filteredUniqueFacetVals[index] as string] ?? DEFAULT_BAR_CHART_HEIGHT) + CHART_HEIGHT_MARGIN}
              width="100%"
              style={{ overflow: 'visible' }}
              ref={listRef}
            >
              {Row}
            </VariableSizeList>
          </ScrollArea>
        ) : null}
      </Stack>
    </Stack>
  );
}
