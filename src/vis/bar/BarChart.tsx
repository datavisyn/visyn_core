import { Box, Center, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues } from 'd3v7';
import groupBy from 'lodash/groupBy';
import round from 'lodash/round';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';
import zipWith from 'lodash/zipWith';
import React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors as colorScale } from '../../utils/colors';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { getLabelOrUnknown } from '../general/utils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisProps, VisNumericalValue } from '../interfaces';
import { BarChartSortButton } from './BarChartSortButton';
import { AggregatedDataType, median, SingleEChartsBarChart } from './SingleEChartsBarChart';
import { FocusFacetSelector } from './barComponents/FocusFacetSelector';
import { BAR_SPACING, BAR_WIDTH, CHART_HEIGHT_MARGIN, VERTICAL_BAR_CHART_HEIGHT } from './constants';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, IBarDataTableRow } from './interfaces';
import { createBinLookup, getBarData } from './utils';

const DEFAULT_FACET_NAME = '$default$';

function calculateChartHeight(config: IBarConfig, dataTable: IBarDataTableRow[], facetValue: string) {
  const categories = new Set();
  const groupings = new Set();
  dataTable
    .filter((i) => i.facet === facetValue)
    .forEach((item) => {
      categories.add(item.category);
      groupings.add(item.group);
    });

  if (config.direction === EBarDirection.VERTICAL) {
    // use fixed height for vertical bars
    return VERTICAL_BAR_CHART_HEIGHT + CHART_HEIGHT_MARGIN;
  }
  if (config.direction === EBarDirection.HORIZONTAL) {
    // calculate height for horizontal bars
    const categoryWidth = config.group && config.groupType === EBarGroupingType.STACK ? BAR_WIDTH + BAR_SPACING : (BAR_WIDTH + BAR_SPACING) * groupings.size; // TODO: Make dynamic group length based on series data filtered for null
    return categories.size * categoryWidth + 2 * BAR_SPACING + CHART_HEIGHT_MARGIN;
  }
  return 0;
}

function getAggregatedDataMap(
  isFaceted: boolean,
  dataTable: IBarDataTableRow[],
  selectedMap: ICommonVisProps<IBarConfig>['selectedMap'],
  aggregateType: EAggregateTypes,
) {
  const facetGrouped = isFaceted ? groupBy(dataTable, 'facet') : { [DEFAULT_FACET_NAME]: dataTable };
  const aggregated: { facets: { [facet: string]: AggregatedDataType }; globalDomain: { min: number; max: number } } = {
    facets: {},
    globalDomain: { min: Infinity, max: -Infinity },
  };
  const minMax: { facets: { [facet: string]: AggregatedDataType } } = { facets: {} };
  Object.keys(facetGrouped).forEach((facet) => {
    const values = facetGrouped[facet];
    const facetSensitiveDataTable = facet === DEFAULT_FACET_NAME ? dataTable : dataTable.filter((item) => item.facet === facet);
    const categoriesList = uniq(facetSensitiveDataTable.map((item) => item.category)) ?? [];
    const groupingsList = uniq(facetSensitiveDataTable.map((item) => item.group)) ?? [];
    (values ?? []).forEach((item) => {
      const { category, agg, group } = item;
      const selected = selectedMap?.[item.id] || false;
      if (!aggregated.facets[facet]) {
        aggregated.facets[facet] = { categoriesList, groupingsList, categories: {} };
      } else {
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
      }

      if (!minMax.facets[facet]) {
        minMax.facets[facet] = { categoriesList: [], groupingsList: [], categories: {} };
      } else {
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
        switch (aggregateType) {
          case EAggregateTypes.COUNT:
            aggregated.globalDomain.max = Math.max(aggregated.facets[facet]?.categories[category]?.total ?? -Infinity, aggregated.globalDomain.max);
            aggregated.globalDomain.min = Math.min(aggregated.facets[facet]?.categories[category]?.total ?? Infinity, aggregated.globalDomain.min, 0);
            break;

          case EAggregateTypes.AVG:
            aggregated.globalDomain.max = round(
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
            aggregated.globalDomain.max = Math.max(
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
            aggregated.globalDomain.max = Math.max(
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
            aggregated.globalDomain.max = Math.max(Math.max(selectedMedian ?? -Infinity, unselectedMedian ?? -Infinity), aggregated.globalDomain.max);
            aggregated.globalDomain.min = Math.min(Math.min(selectedMedian ?? Infinity, unselectedMedian ?? Infinity), aggregated.globalDomain.min, 0);
            break;
          }

          default:
            console.warn(`Aggregation type ${aggregateType} is not supported by bar chart.`);
            break;
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

  const aggregatedDataMap = React.useMemo(
    () => getAggregatedDataMap(!!config?.facets, dataTable, selectedMap, config?.aggregateType as EAggregateTypes),
    [config?.aggregateType, config?.facets, dataTable, selectedMap],
  );

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

  const isToolbarVisible = config?.showFocusFacetSelector || showDownloadScreenshot || config?.display !== EBarDisplayType.NORMALIZED;
  const innerHeight = containerHeight - (isToolbarVisible ? 40 : 0);

  const itemData = React.useMemo(
    () => ({
      aggregatedDataMap,
      selectedList,
      selectedMap,
      groupColorScale,
      filteredUniqueFacetVals,
      config,
      setConfig,
      allUniqueFacetVals,
      customSelectionCallback,
    }),
    [aggregatedDataMap, selectedList, selectedMap, customSelectionCallback, setConfig, groupColorScale, filteredUniqueFacetVals, config, allUniqueFacetVals],
  );

  const Row = React.useCallback((props: ListChildComponentProps<typeof itemData>) => {
    const multiplesVal = props.data.filteredUniqueFacetVals?.[props.index];

    return (
      <Box component="div" style={props.style}>
        <SingleEChartsBarChart
          config={props.data.config}
          aggregatedData={props.data.aggregatedDataMap.facets[multiplesVal as string]!}
          globalMin={props.data.aggregatedDataMap.globalDomain.min}
          globalMax={props.data.aggregatedDataMap.globalDomain.max}
          selectedList={props.data.selectedList}
          selectedFacetValue={multiplesVal}
          selectedFacetIndex={multiplesVal ? props.data.allUniqueFacetVals.indexOf(multiplesVal) : undefined} // use the index of the original list to return back to the grid
          setConfig={props.data.setConfig}
          selectionCallback={props.data.customSelectionCallback}
          groupColorScale={props.data.groupColorScale!}
          selectedMap={props.data.selectedMap}
        />
      </Box>
    );
  }, []);

  const handleScroll = React.useCallback(({ y }: { y: number }) => {
    listRef.current?.scrollTo(y);
  }, []);

  const calculateFacetChartHeight = React.useCallback(
    (index: number): number => (config ? calculateChartHeight(config, dataTable, filteredUniqueFacetVals[index] as string) : 0),
    [config, dataTable, filteredUniqueFacetVals],
  );

  return (
    <Stack data-testid="vis-bar-chart-container" flex={1} style={{ width: '100%', height: '100%' }} ref={resizeObserverRef}>
      {showDownloadScreenshot || config?.showFocusFacetSelector === true ? (
        <Group justify="center">
          {config?.showFocusFacetSelector === true ? <FocusFacetSelector config={config} setConfig={setConfig} facets={allUniqueFacetVals} /> : null}
          {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config!} /> : null}
          {config?.display !== EBarDisplayType.NORMALIZED ? <BarChartSortButton config={config!} setConfig={setConfig!} /> : null}
        </Group>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: innerHeight }}>
        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : !config?.facets || !allColumns?.facetsColVals ? (
          <ScrollArea.Autosize h={innerHeight} w={containerWidth} scrollbars="y" offsetScrollbars style={{ overflowX: 'hidden' }}>
            <SingleEChartsBarChart
              config={config}
              aggregatedData={aggregatedDataMap.facets[DEFAULT_FACET_NAME]!}
              globalMin={aggregatedDataMap.globalDomain.min}
              globalMax={aggregatedDataMap.globalDomain.max}
              selectedList={selectedList}
              setConfig={setConfig}
              selectionCallback={customSelectionCallback}
              groupColorScale={groupColorScale!}
              selectedMap={selectedMap}
            />
          </ScrollArea.Autosize>
        ) : null}

        {colsStatus === 'success' && config?.facets && allColumns?.facetsColVals ? (
          // NOTE: @dv-usama-ansari: Referenced from https://codesandbox.io/p/sandbox/react-window-with-scrollarea-g9dg6d?file=%2Fsrc%2FApp.tsx%3A40%2C8
          <ScrollArea style={{ width: '100%', height: innerHeight }} onScrollPositionChange={handleScroll} type="hover" scrollHideDelay={0}>
            <VariableSizeList
              height={innerHeight}
              itemCount={filteredUniqueFacetVals.length}
              itemData={itemData}
              itemSize={calculateFacetChartHeight}
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
