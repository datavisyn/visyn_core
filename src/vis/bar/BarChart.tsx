import * as React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

import { Box, Group, ScrollArea, Stack } from '@mantine/core';
import { useElementSize, useShallowEffect } from '@mantine/hooks';
import { type ScaleOrdinal, scaleOrdinal, schemeBlues } from 'd3v7';
import uniqueId from 'lodash/uniqueId';

import { BlurredOverlay } from '../../components';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors10 } from '../../utils/colors';
import { DownloadPlotButton, ErrorMessage } from '../general';
import { FastTextMeasure } from '../general/FastTextMeasure';
import { NAN_REPLACEMENT } from '../general/constants';
import { getLabelOrUnknown } from '../general/utils';
import { ColumnInfo, EColumnTypes, ICommonVisProps } from '../interfaces';
import { SingleEChartsBarChart } from './SingleEChartsBarChart';
import { FocusFacetSelector } from './components';
import { EBarDirection, IBarConfig } from './interfaces';
import {
  AggregatedDataType,
  CHART_HEIGHT_MARGIN,
  DEFAULT_BAR_CHART_HEIGHT,
  DEFAULT_FACET_NAME,
  GenerateAggregatedDataLookup,
  WorkerWrapper,
  generateAggregatedDataLookup,
  generateDataTable,
  generateFacetDimensionsLookup,
  getBarData,
} from './interfaces/internal';

type VirtualizedBarChartProps = {
  aggregatedDataLookup: Awaited<ReturnType<typeof generateAggregatedDataLookup>>;
  allUniqueFacetVals: string[];
  containerHeight: number;
  containerWidth: number;
  config: IBarConfig;
  facetDimensionLookup: Awaited<ReturnType<typeof generateFacetDimensionsLookup>>;
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

const textMeasure = new FastTextMeasure('16px Arial');

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

  const generateAggregatedDataLookupWorker = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['generateAggregatedDataLookup']>) => WorkerWrapper.generateAggregatedDataLookup(...args),
    [],
  );
  const { execute: generateAggregatedDataLookupTrigger, status: dataLookupStatus } = useAsync(generateAggregatedDataLookupWorker);

  const generateFacetDimensionLookupWorker = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['generateFacetDimensionsLookup']>) => WorkerWrapper.generateFacetDimensionsLookup(...args),
    [],
  );
  const { execute: generateFacetDimensionLookupTrigger, status: dimensionsLookupStatus } = useAsync(generateFacetDimensionLookupWorker);

  const [itemData, setItemData] = React.useState<VirtualizedBarChartProps | null>(null);
  const [dataTable, setDataTable] = React.useState<ReturnType<typeof generateDataTable>>([]);
  const [aggregatedDataLookup, setAggregatedDataLookup] = React.useState<Awaited<ReturnType<typeof generateAggregatedDataLookupWorker>> | null>(null);
  const [facetDimensionLookup, setFacetDimensionLookup] = React.useState<Awaited<ReturnType<typeof generateFacetDimensionLookupWorker>> | null>(null);
  const [gridLeft, setGridLeft] = React.useState(containerWidth / 3);
  const [labelsMap, setLabelsMap] = React.useState<Record<string, string>>({});
  const [longestLabelWidth, setLongestLabelWidth] = React.useState(0);

  const listRef = React.useRef<VariableSizeList>(null);

  const id = React.useMemo(() => uniquePlotId || uniqueId('BarChartVis'), [uniquePlotId]);

  const isLoading = React.useMemo(() => barDataStatus === 'pending' || dataTableStatus === 'pending', [barDataStatus, dataTableStatus]);

  const isError = React.useMemo(
    () => barDataStatus === 'error' || dataTableStatus === 'error' || dataLookupStatus === 'error',
    [barDataStatus, dataLookupStatus, dataTableStatus],
  );

  const isSuccess = React.useMemo(() => barDataStatus === 'success' && dataTableStatus === 'success', [barDataStatus, dataTableStatus]);

  const allUniqueFacetVals = React.useMemo(() => {
    const set = new Set();
    barData?.facetsColVals?.resolvedValues.forEach((v) => set.add(getLabelOrUnknown(v.val)));
    const uniqueFacetValues = [...set] as string[];
    return uniqueFacetValues.sort((a, b) => (a === NAN_REPLACEMENT ? 1 : b === NAN_REPLACEMENT ? -1 : a && b ? a.localeCompare(b) : 0));
  }, [barData?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = React.useMemo(() => {
    const unsorted =
      typeof config?.focusFacetIndex === 'number' && config?.focusFacetIndex < allUniqueFacetVals.length
        ? ([allUniqueFacetVals[config?.focusFacetIndex]] as string[])
        : allUniqueFacetVals;
    return unsorted.sort((a, b) => (a === NAN_REPLACEMENT ? 1 : b === NAN_REPLACEMENT ? -1 : a && b ? a.localeCompare(b) : 0));
  }, [allUniqueFacetVals, config?.focusFacetIndex]);

  const groupColorScale = React.useMemo(() => {
    if (!barData?.groupColVals) {
      return null;
    }

    const groups =
      barData.groupColVals.type === EColumnTypes.NUMERICAL
        ? [
            ...new Set(
              Object.values(aggregatedDataLookup?.facets ?? {})
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
        : aggregatedDataLookup?.facetsList[0] === DEFAULT_FACET_NAME
          ? (aggregatedDataLookup?.facets[DEFAULT_FACET_NAME]?.groupingsList ?? [])
          : config?.group?.id === config?.facets?.id
            ? (aggregatedDataLookup?.facetsList ?? [])
            : [
                ...new Set(
                  Object.values(aggregatedDataLookup?.facets ?? {}).flatMap((facet) => {
                    return facet.groupingsList;
                  }),
                ),
              ];

    const maxGroupings = Object.values(aggregatedDataLookup?.facets ?? {}).reduce((acc: number, facet) => Math.max(acc, facet.groupingsList.length), 0);

    const range =
      barData.groupColVals.type === EColumnTypes.NUMERICAL
        ? config?.catColumnSelected?.id === config?.facets?.id
          ? (schemeBlues[Math.max(Math.min(groups.length - 1, maxGroupings), 3)] as string[]).slice(0, maxGroupings)
          : (schemeBlues[Math.max(Math.min(groups.length - 1, 9), 3)] as string[]) // use at least 3 colors for numerical values
        : groups.map(
            (group, i) => (barData?.groupColVals?.color?.[group] || categoricalColors10[i % categoricalColors10.length]) as string, // use the custom color from the column if available, otherwise use the default color scale
          );

    return scaleOrdinal<string>().domain(groups).range(range);
  }, [aggregatedDataLookup, barData, config]);

  const shouldRenderFacets = React.useMemo(
    () =>
      Boolean(
        config?.facets &&
          barData?.facetsColVals &&
          (config?.focusFacetIndex !== undefined || config?.focusFacetIndex !== null) &&
          dimensionsLookupStatus === 'success',
      ),
    [config?.facets, config?.focusFacetIndex, barData?.facetsColVals, dimensionsLookupStatus],
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
    const data = props.data.aggregatedDataLookup?.facets[facet as string] as AggregatedDataType;

    return (
      data && (
        <Box component="div" data-facet={facet} style={{ ...props.style, padding: '10px 0px' }}>
          <SingleEChartsBarChart
            aggregatedData={data}
            containerWidth={props.data.containerWidth}
            config={props.data.config}
            dimensions={props.data.facetDimensionLookup?.facets[facet as string] as { height: number; minWidth: number }}
            globalMax={props.data.aggregatedDataLookup?.globalDomain.max}
            globalMin={props.data.aggregatedDataLookup?.globalDomain.min}
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
      )
    );
  }, []);

  const handleScroll = React.useCallback(({ y }: { y: number }) => {
    listRef.current?.scrollTo(y);
  }, []);

  const calculateItemHeight = React.useCallback(
    (index: number) => {
      const currentFacetValue = filteredUniqueFacetVals[index] as string;
      const currentFacetData = facetDimensionLookup?.facets[currentFacetValue];
      const computedFacetHeight = currentFacetData?.height;
      const calculatedItemHeight = (computedFacetHeight ?? DEFAULT_BAR_CHART_HEIGHT) + CHART_HEIGHT_MARGIN;
      return calculatedItemHeight;
    },
    [facetDimensionLookup?.facets, filteredUniqueFacetVals],
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
      if (config) {
        const lookup = await generateAggregatedDataLookupTrigger(config, dataTable, selectedMap);
        setAggregatedDataLookup(lookup);
      }
    };
    fetchLookup();
  }, [config, dataTable, generateAggregatedDataLookupTrigger, selectedMap]);

  useShallowEffect(() => {
    const fetchLookup = async () => {
      if (config) {
        const lookup = await generateFacetDimensionLookupTrigger(config, dataTable, containerHeight);
        setFacetDimensionLookup(lookup);
      }
    };
    fetchLookup();
  }, [config, dataTable, generateFacetDimensionLookupTrigger, containerHeight]);

  useShallowEffect(() => {
    Object.values(aggregatedDataLookup?.facets ?? {})
      .map((value) => value?.categoriesList ?? [])
      .flat()
      .forEach((c) => {
        const text = textMeasure.textEllipsis(c, config?.direction === EBarDirection.HORIZONTAL ? Math.max(gridLeft, containerWidth / 3) - 20 : 70);
        setLongestLabelWidth((p) => Math.max(p, textMeasure.fastMeasureText(c)));
        setLabelsMap((prev) => ({ ...prev, [c]: text }));
      });
    setGridLeft(Math.min(containerWidth / 3, Math.max(longestLabelWidth + 20, 60)));
  }, [aggregatedDataLookup?.facets, config?.direction, containerWidth, gridLeft, longestLabelWidth]);

  React.useEffect(() => {
    setItemData({
      aggregatedDataLookup: aggregatedDataLookup!,
      allUniqueFacetVals,
      config: config!,
      containerHeight,
      containerWidth,
      facetDimensionLookup: facetDimensionLookup!,
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
    aggregatedDataLookup,
    allUniqueFacetVals,
    config,
    containerHeight,
    containerWidth,
    customSelectionCallback,
    facetDimensionLookup,
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
                aggregatedData={aggregatedDataLookup?.facets[DEFAULT_FACET_NAME] as AggregatedDataType}
                containerWidth={containerWidth}
                dimensions={facetDimensionLookup?.facets[DEFAULT_FACET_NAME] as { height: number; minWidth: number }}
                globalMin={aggregatedDataLookup?.globalDomain.min}
                globalMax={aggregatedDataLookup?.globalDomain.max}
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
