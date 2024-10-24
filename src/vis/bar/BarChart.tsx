import { Box, Group, ScrollArea, Stack } from '@mantine/core';
import { useElementSize, useShallowEffect } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues, type ScaleOrdinal } from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import * as React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import { BlurredOverlay } from '../../components';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors10 } from '../../utils/colors';
import { NAN_REPLACEMENT } from '../general';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { ErrorMessage } from '../general/ErrorMessage';
import { getLabelOrUnknown } from '../general/utils';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisProps } from '../interfaces';
import { FocusFacetSelector } from './components';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './interfaces';
import {
  AggregatedDataType,
  calculateChartHeight,
  calculateChartMinWidth,
  CHART_HEIGHT_MARGIN,
  DEFAULT_BAR_CHART_HEIGHT,
  DEFAULT_BAR_CHART_MIN_WIDTH,
  DEFAULT_FACET_NAME,
  generateAggregatedDataLookup,
  GenerateAggregatedDataLookup,
  generateDataTable,
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

  const { value: barData, status: barDataStatus } = useAsync(getBarData, [
    columns,
    config?.catColumnSelected as ColumnInfo,
    config?.group as ColumnInfo,
    config?.facets as ColumnInfo,
    config?.aggregateColumn as ColumnInfo,
  ]);
  const generateDataTableWorker = React.useCallback(async (...args: Parameters<typeof generateDataTable>) => WorkerWrapper.generateDataTable(...args), []);
  const { execute: generateDataTableTrigger, status: dataTableStatus } = useAsync(generateDataTableWorker);

  const generateAggregateDataLookupWorker = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['generateAggregatedDataLookup']>) => WorkerWrapper.generateAggregatedDataLookup(...args),
    [],
  );
  const { execute: generateAggregatedDataLookupTrigger, status: dataLookupStatus } = useAsync(generateAggregateDataLookupWorker);

  const getTruncatedTextMapWorker = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['getTruncatedTextMap']>) => WorkerWrapper.getTruncatedTextMap(...args),
    [],
  );
  const { execute: getTruncatedTextMapTrigger, status: truncatedTextStatus } = useAsync(getTruncatedTextMapWorker);

  const [itemData, setItemData] = React.useState<VirtualizedBarChartProps | null>(null);
  const [dataTable, setDataTable] = React.useState<ReturnType<typeof generateDataTable>>([]);
  const [aggregatedDataMap, setAggregatedDataMap] = React.useState<Awaited<ReturnType<typeof generateAggregateDataLookupWorker>> | null>(null);
  const [gridLeft, setGridLeft] = React.useState(containerWidth / 3);
  const [labelsMap, setLabelsMap] = React.useState<Record<string, string>>({});
  const [longestLabelWidth, setLongestLabelWidth] = React.useState(0);

  const listRef = React.useRef<VariableSizeList>(null);

  const id = React.useMemo(() => uniquePlotId || uniqueId('BarChartVis'), [uniquePlotId]);

  const isLoading = React.useMemo(() => barDataStatus === 'pending' || dataTableStatus === 'pending', [barDataStatus, dataTableStatus]);

  const isError = React.useMemo(
    () => barDataStatus === 'error' || dataTableStatus === 'error' || dataLookupStatus === 'error' || truncatedTextStatus === 'error',
    [barDataStatus, dataLookupStatus, dataTableStatus, truncatedTextStatus],
  );

  const isSuccess = React.useMemo(() => barDataStatus === 'success' && dataTableStatus === 'success', [barDataStatus, dataTableStatus]);

  const allUniqueFacetVals = React.useMemo(() => {
    const set = new Set();
    barData?.facetsColVals?.resolvedValues.forEach((v) => set.add(getLabelOrUnknown(v.val)));
    return [...set] as string[];
  }, [barData?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = React.useMemo(() => {
    const unsorted =
      typeof config?.focusFacetIndex === 'number' && config?.focusFacetIndex < allUniqueFacetVals.length
        ? ([allUniqueFacetVals[config?.focusFacetIndex]] as string[])
        : allUniqueFacetVals;
    return unsorted.sort((a, b) => (a === NAN_REPLACEMENT || b === NAN_REPLACEMENT ? 1 : a && b ? a.localeCompare(b) : 0));
  }, [allUniqueFacetVals, config?.focusFacetIndex]);

  const groupColorScale = React.useMemo(() => {
    if (!barData?.groupColVals) {
      return null;
    }

    const groups =
      barData.groupColVals.type === EColumnTypes.NUMERICAL
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
      barData.groupColVals.type === EColumnTypes.NUMERICAL
        ? config?.catColumnSelected?.id === config?.facets?.id
          ? (schemeBlues[Math.max(Math.min(groups.length - 1, maxGroupings), 3)] as string[]).slice(0, maxGroupings)
          : (schemeBlues[Math.max(Math.min(groups.length - 1, 9), 3)] as string[]) // use at least 3 colors for numerical values
        : groups.map(
            (group, i) => (barData?.groupColVals?.color?.[group] || categoricalColors10[i % categoricalColors10.length]) as string, // use the custom color from the column if available, otherwise use the default color scale
          );

    return scaleOrdinal<string>().domain(groups).range(range);
  }, [aggregatedDataMap, barData, config]);

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

  const shouldRenderFacets = React.useMemo(
    () => Boolean(config?.facets && barData?.facetsColVals && filteredUniqueFacetVals.length === Object.keys(chartHeightMap).length),
    [config?.facets, barData?.facetsColVals, filteredUniqueFacetVals.length, chartHeightMap],
  );

  const isGroupedByNumerical = React.useMemo(() => barData?.groupColVals?.type === EColumnTypes.NUMERICAL, [barData?.groupColVals?.type]);

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

  const Row = React.useCallback((props: ListChildComponentProps<typeof itemData>) => {
    if (!props.data) {
      return null;
    }
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

  const handleScroll = React.useCallback(({ y }: { y: number }) => {
    listRef.current?.scrollTo(y);
  }, []);

  const calculateItemHeight = React.useCallback(
    (index: number) => (chartHeightMap[filteredUniqueFacetVals[index] as string] ?? DEFAULT_BAR_CHART_HEIGHT) + CHART_HEIGHT_MARGIN,
    [chartHeightMap, filteredUniqueFacetVals],
  );

  React.useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [config, dataTable]);

  useShallowEffect(() => {
    if (barDataStatus === 'success' && barData) {
      const fetchDataTable = async () => {
        const table = await generateDataTableTrigger({
          aggregateColVals: {
            info: barData.aggregateColVals?.info,
            resolvedValues: barData.aggregateColVals?.resolvedValues,
            type: barData.aggregateColVals?.type,
          },
          catColVals: {
            info: barData.catColVals?.info,
            resolvedValues: barData.catColVals?.resolvedValues,
            type: barData.catColVals?.type,
          },
          facetsColVals: {
            info: barData.facetsColVals?.info,
            resolvedValues: barData.facetsColVals?.resolvedValues,
            type: barData.facetsColVals?.type,
          },
          groupColVals: {
            info: barData.groupColVals?.info,
            resolvedValues: barData.groupColVals?.resolvedValues,
            type: barData.groupColVals?.type,
          },
        });
        setDataTable(table);
      };
      fetchDataTable();
    }
  }, [barData, barDataStatus, generateDataTableTrigger]);

  useShallowEffect(() => {
    const fetchLookup = async () => {
      const lookup = await generateAggregatedDataLookupTrigger(
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
  }, [
    config?.aggregateType,
    config?.display,
    config?.facets?.id,
    config?.group?.id,
    config?.groupType,
    dataTable,
    generateAggregatedDataLookupTrigger,
    selectedMap,
  ]);

  useShallowEffect(() => {
    const fetchTruncatedTextMap = async () => {
      const truncatedTextMap = await getTruncatedTextMapTrigger(
        Object.values(aggregatedDataMap?.facets ?? {})
          .map((value) => value?.categoriesList ?? [])
          .flat(),
        config?.direction === EBarDirection.HORIZONTAL ? Math.max(gridLeft, containerWidth / 3) - 20 : 70,
      );
      setLabelsMap(truncatedTextMap.map);
      setLongestLabelWidth(truncatedTextMap.longestLabelWidth);
      setGridLeft(Math.min(containerWidth / 3, Math.max(longestLabelWidth + 20, 60)));
    };
    fetchTruncatedTextMap();
  }, [aggregatedDataMap?.facets, aggregatedDataMap?.facetsList, config?.direction, containerWidth, getTruncatedTextMapTrigger, gridLeft, longestLabelWidth]);

  React.useEffect(() => {
    setItemData({
      aggregatedDataMap: aggregatedDataMap!,
      allUniqueFacetVals,
      chartHeightMap,
      chartMinWidthMap,
      config: config!,
      containerHeight,
      containerWidth,
      filteredUniqueFacetVals,
      groupColorScale: groupColorScale!,
      isGroupedByNumerical,
      labelsMap,
      longestLabelWidth,
      selectedList: selectedList!,
      selectedMap: selectedMap!,
      selectionCallback: customSelectionCallback,
      setConfig: setConfig!,
    } satisfies VirtualizedBarChartProps);
  }, [
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
    longestLabelWidth,
    selectedList,
    selectedMap,
    setConfig,
  ]);

  return isLoading ? (
    <BlurredOverlay loading dataTestId="visyn-bar-chart-loading-data-overlay" visible loadingText="Crunching numbers, this may take a moment &hellip;" />
  ) : isError ? (
    <Stack mih={DEFAULT_BAR_CHART_HEIGHT} align="center" justify="center" data-test-id="visyn-bar-chart-loading-data-error">
      <ErrorMessage dataTestId="visyn-vis-bar-chart-processing-data-error">
        Something went wrong while loading and processing the data. Please try again.
      </ErrorMessage>
    </Stack>
  ) : (
    isSuccess && (
      <Stack data-testid="vis-bar-chart-container" flex={1} style={{ width: '100%', height: '100%' }} ref={resizeObserverRef}>
        {showDownloadScreenshot || config?.showFocusFacetSelector === true ? (
          <Group justify="center">
            {config?.showFocusFacetSelector === true ? <FocusFacetSelector config={config} setConfig={setConfig} facets={allUniqueFacetVals} /> : null}
            {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config!} /> : null}
          </Group>
        ) : null}
        <Stack gap={0} id={id} style={{ width: '100%', height: containerHeight }}>
          {!config?.facets || !barData?.facetsColVals ? (
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
                longestLabelWidth={longestLabelWidth}
                selectedList={selectedList}
                setConfig={setConfig}
                selectionCallback={customSelectionCallback}
                selectedMap={selectedMap}
              />
            </ScrollArea>
          ) : config?.facets && barData?.facetsColVals ? (
            // NOTE: @dv-usama-ansari: Referenced from https://codesandbox.io/p/sandbox/react-window-with-scrollarea-g9dg6d?file=%2Fsrc%2FApp.tsx%3A40%2C8
            shouldRenderFacets && (
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
                  itemSize={calculateItemHeight}
                  width="100%"
                  style={{ overflow: 'visible' }}
                  ref={listRef}
                >
                  {Row}
                </VariableSizeList>
              </ScrollArea>
            )
          ) : null}
        </Stack>
      </Stack>
    )
  );
}
