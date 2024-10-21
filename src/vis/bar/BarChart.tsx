import { Box, Center, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { useElementSize, useShallowEffect } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues, type ScaleOrdinal } from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import zipWith from 'lodash/zipWith';
import * as React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors as colorScale } from '../../utils/colors';
import { NAN_REPLACEMENT } from '../general';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { getLabelOrUnknown } from '../general/utils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisProps, VisNumericalValue } from '../interfaces';
import { FocusFacetSelector } from './components';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './interfaces';
import {
  AggregatedDataType,
  calculateChartHeight,
  calculateChartMinWidth,
  CHART_HEIGHT_MARGIN,
  createBinLookup,
  DEFAULT_BAR_CHART_HEIGHT,
  DEFAULT_BAR_CHART_MIN_WIDTH,
  DEFAULT_FACET_NAME,
  generateAggregatedDataLookup,
  GenerateAggregatedDataLookup,
  getBarData,
  WorkerWrapper,
} from './interfaces/internal';
import { SingleEChartsBarChart } from './SingleEChartsBarChart';

type VirtualizedBarChartProps = {
  aggregatedDataMap: Awaited<ReturnType<typeof generateAggregatedDataLookup>>;
  allUniqueFacetVals: string[];
  chartHeightMap: Record<string, number>;
  chartMinWidthMap: Record<string, number>;
  containerHeight: number;
  containerWidth: number;
  config: IBarConfig;
  filteredUniqueFacetVals: string[];
  groupColorScale: ScaleOrdinal<string, string>;
  isGroupedByNumerical: boolean;
  labelsMap: Record<string, string>;
  longestLabelWidth: number;
  selectedFacetIndex?: number;
  selectedFacetValue?: string;
  selectedList: string[];
  selectedMap: Record<string, boolean>;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
  setConfig: (config: IBarConfig) => void;
};

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

  const aggregator = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['generateAggregatedDataLookup']>) => WorkerWrapper.generateAggregatedDataLookup(...args),
    [],
  );

  const [aggregatedDataMap, setAggregatedDataMap] = React.useState<Awaited<ReturnType<typeof aggregator>> | null>(null);
  const { execute } = useAsync(aggregator);

  useShallowEffect(() => {
    const fetchLookup = async () => {
      const lookup = await execute(
        {
          isFaceted: !!config?.facets?.id,
          isGrouped: !!config?.group?.id,
          groupType: config?.groupType as EBarGroupingType,
          display: config?.display as EBarDisplayType,
          aggregateType: config?.aggregateType as EAggregateTypes,
        },
        dataTable,
        selectedMap,
      );
      setAggregatedDataMap(lookup);
    };
    fetchLookup();
  }, [config?.aggregateType, config?.display, config?.facets?.id, config?.group?.id, config?.groupType, dataTable, execute, selectedMap]);

  const groupColorScale = React.useMemo(() => {
    if (!allColumns?.groupColVals) {
      return null;
    }

    const groups =
      allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? [
            ...new Set(
              Object.values(aggregatedDataMap?.facets ?? {})
                .flatMap((facet) => facet.groupingsList)
                .sort((a, b) => {
                  const [minA] = a.split(' to ');
                  const [minB] = b.split(' to ');
                  if (minA && minB) {
                    return Number(minA) - Number(minB);
                  }
                  return 0;
                }),
            ),
          ]
        : aggregatedDataMap?.facetsList[0] === DEFAULT_FACET_NAME
          ? (aggregatedDataMap?.facets[DEFAULT_FACET_NAME]?.groupingsList ?? [])
          : config?.group?.id === config?.facets?.id
            ? (aggregatedDataMap?.facetsList ?? [])
            : [
                ...new Set(
                  Object.values(aggregatedDataMap?.facets ?? {}).flatMap((facet) => {
                    return facet.groupingsList;
                  }),
                ),
              ];

    const maxGroupings = Object.values(aggregatedDataMap?.facets ?? {}).reduce((acc: number, facet) => Math.max(acc, facet.groupingsList.length), 0);

    const range =
      allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? config?.catColumnSelected?.id === config?.facets?.id
          ? (schemeBlues[Math.max(Math.min(groups.length - 1, maxGroupings), 3)] as string[]).slice(0, maxGroupings)
          : (schemeBlues[Math.max(Math.min(groups.length - 1, 9), 3)] as string[]) // use at least 3 colors for numerical values
        : groups.map(
            (group, i) => (allColumns?.groupColVals?.color?.[group] || colorScale[i % colorScale.length]) as string, // use the custom color from the column if available, otherwise use the default color scale
          );

    return scaleOrdinal<string>().domain(groups).range(range);
  }, [aggregatedDataMap, allColumns, config]);

  const allUniqueFacetVals = React.useMemo(() => {
    return [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => getLabelOrUnknown(v.val)))] as string[];
  }, [allColumns?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = React.useMemo(() => {
    const unsorted =
      typeof config?.focusFacetIndex === 'number' && config?.focusFacetIndex < allUniqueFacetVals.length
        ? [allUniqueFacetVals[config?.focusFacetIndex]]
        : allUniqueFacetVals;
    return unsorted.sort((a, b) => (a === NAN_REPLACEMENT || b === NAN_REPLACEMENT ? 1 : a && b ? a.localeCompare(b) : 0));
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
    () =>
      ({
        aggregatedDataMap: aggregatedDataMap!,
        allUniqueFacetVals,
        chartHeightMap,
        chartMinWidthMap,
        config: config!,
        containerHeight,
        containerWidth,
        filteredUniqueFacetVals: filteredUniqueFacetVals as string[],
        groupColorScale: groupColorScale!,
        isGroupedByNumerical,
        labelsMap,
        longestLabelWidth: truncatedTextRef.current.longestLabelWidth,
        selectedList: selectedList!,
        selectedMap: selectedMap!,
        selectionCallback: customSelectionCallback,
        setConfig: setConfig!,
      }) satisfies VirtualizedBarChartProps,
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
    const facet = props.data.filteredUniqueFacetVals?.[props.index] as string;
    return (
      <Box component="div" data-facet={facet} style={{ ...props.style, padding: '10px 0px' }}>
        <SingleEChartsBarChart
          aggregatedData={props.data.aggregatedDataMap?.facets[facet as string] as AggregatedDataType}
          chartHeight={props.data.chartHeightMap[facet as string] ?? DEFAULT_BAR_CHART_HEIGHT}
          chartMinWidth={props.data.chartMinWidthMap[facet as string] ?? DEFAULT_BAR_CHART_MIN_WIDTH}
          containerWidth={props.data.containerWidth}
          config={props.data.config}
          globalMax={props.data.aggregatedDataMap?.globalDomain.max}
          globalMin={props.data.aggregatedDataMap?.globalDomain.min}
          groupColorScale={props.data.groupColorScale!}
          isGroupedByNumerical={props.data.isGroupedByNumerical}
          labelsMap={props.data.labelsMap}
          longestLabelWidth={props.data.longestLabelWidth}
          selectedFacetIndex={facet ? props.data.allUniqueFacetVals.indexOf(facet) : undefined} // use the index of the original list to return back to the grid
          selectedFacetValue={facet}
          selectedList={props.data.selectedList}
          selectedMap={props.data.selectedMap}
          selectionCallback={props.data.selectionCallback}
          setConfig={props.data.setConfig}
        />
      </Box>
    );
  }, []);

  // NOTE: @dv-usama-ansari: This function is a performance bottleneck.
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
      const longestLabelWidth = Math.max(truncatedTextRef.current.longestLabelWidth, textEl.scrollWidth);
      truncatedTextRef.current.longestLabelWidth = longestLabelWidth;

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
    setGridLeft(Math.min(containerWidth / 3, Math.max(truncatedTextRef.current.longestLabelWidth + 20, 60)));
  }, [containerWidth, getTruncatedText, config?.catColumnSelected?.id, aggregatedDataMap?.facets]);

  React.useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [config, dataTable]);

  return (
    <Stack data-testid="vis-bar-chart-container" flex={1} style={{ width: '100%', height: '100%' }} ref={resizeObserverRef}>
      {showDownloadScreenshot || config?.showFocusFacetSelector === true ? (
        <Group justify="center">
          {config?.showFocusFacetSelector === true ? <FocusFacetSelector config={config} setConfig={setConfig} facets={allUniqueFacetVals} /> : null}
          {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config!} /> : null}
        </Group>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: containerHeight }}>
        {colsStatus === 'pending' ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          colsStatus === 'success' &&
          (!config?.facets || !allColumns?.facetsColVals ? (
            <ScrollArea
              style={{ width: '100%', height: containerHeight - CHART_HEIGHT_MARGIN / 2 }}
              scrollbars={config?.direction === EBarDirection.HORIZONTAL ? 'y' : 'x'}
              offsetScrollbars
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
          ) : config?.facets && allColumns?.facetsColVals ? (
            // NOTE: @dv-usama-ansari: Referenced from https://codesandbox.io/p/sandbox/react-window-with-scrollarea-g9dg6d?file=%2Fsrc%2FApp.tsx%3A40%2C8
            <ScrollArea
              style={{ width: '100%', height: containerHeight - CHART_HEIGHT_MARGIN / 2 }}
              onScrollPositionChange={handleScroll}
              type="hover"
              scrollHideDelay={0}
              offsetScrollbars
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
          ) : null)
        )}
      </Stack>
    </Stack>
  );
}
