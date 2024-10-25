import { Box, Stack, Text } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import type { ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';
import * as React from 'react';
import { BlurredOverlay } from '../../components';
import { type ECOption, useChart } from '../../echarts';
import { useAsync } from '../../hooks';
import { sanitize, selectionColorDark } from '../../utils';
import { DEFAULT_COLOR, NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../general';
import { ErrorMessage } from '../general/ErrorMessage';
import { WarningMessage } from '../general/WarningMessage';
import { ColumnInfo, EAggregateTypes, ICommonVisProps } from '../interfaces';
import { useBarSortHelper } from './hooks';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortParameters, EBarSortState, IBarConfig, SortDirectionMap } from './interfaces';
import {
  AggregatedDataType,
  BAR_WIDTH,
  CHART_HEIGHT_MARGIN,
  DEFAULT_BAR_CHART_HEIGHT,
  GenerateAggregatedDataLookup,
  SERIES_ZERO,
  sortSeries,
  WorkerWrapper,
} from './interfaces/internal';

function generateHTMLString({ label, value, color }: { label: string; value: string; color?: string }): string {
  return `<div style="display: flex; gap: 8px">
  <div><span>${label}:</span></div>
  <div style="display: flex; flex-wrap: nowrap; align-items: center; gap: 8px">
    <div><span style="font-weight: bold">${value}</span></div>
    ${color ? `<div style="width: 12px; height: 12px; border-radius: 12px; background-color: ${color};" />` : ''}
  </div>
</div>`;
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
  maximumSignificantDigits: 4,
  notation: 'compact',
  compactDisplay: 'short',
});

function EagerSingleEChartsBarChart({
  aggregatedData,
  chartHeight,
  chartMinWidth,
  config,
  containerWidth,
  globalMax,
  globalMin,
  groupColorScale,
  isGroupedByNumerical,
  labelsMap,
  longestLabelWidth,
  selectedFacetIndex,
  selectedFacetValue,
  selectedList,
  selectedMap,
  selectionCallback,
  setConfig,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedMap' | 'selectedList'> & {
  aggregatedData: AggregatedDataType;
  chartHeight: number;
  chartMinWidth: number;
  containerWidth: number;
  globalMax?: number;
  globalMin?: number;
  groupColorScale: ScaleOrdinal<string, string, never>;
  isGroupedByNumerical: boolean;
  labelsMap: Record<string, string>;
  longestLabelWidth: number;
  selectedFacetIndex?: number;
  selectedFacetValue?: string;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
}) {
  const generateBarSeriesWorker = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['generateBarSeries']>) => WorkerWrapper.generateBarSeries(...args),
    [],
  );
  const { execute: generateBarSeriesTrigger, status: generateBarSeriesStatus } = useAsync(generateBarSeriesWorker);
  const [getSortMetadata] = useBarSortHelper({ config: config! });
  const [visState, setVisState] = useSetState({
    series: [] as BarSeriesOption[],
    xAxis: null as ECOption['xAxis'] | null,
    yAxis: null as ECOption['yAxis'] | null,
  });

  const hasSelected = React.useMemo(() => (selectedMap ? Object.values(selectedMap).some((selected) => selected) : false), [selectedMap]);
  const gridLeft = React.useMemo(() => Math.min(longestLabelWidth + 20, containerWidth / 3), [containerWidth, longestLabelWidth]);

  const groupSortedSeries = React.useMemo(() => {
    const filteredVisStateSeries = (visState.series ?? []).filter((series) => series.data?.some((d) => d !== null && d !== undefined));
    const [knownSeries, unknownSeries] = filteredVisStateSeries.reduce(
      (acc, series) => {
        if ((series as typeof series & { group: string }).group === NAN_REPLACEMENT) {
          acc[1].push(series);
        } else {
          acc[0].push(series);
        }
        return acc;
      },
      [[] as BarSeriesOption[], [] as BarSeriesOption[]],
    );
    if (isGroupedByNumerical) {
      if (!knownSeries.some((series) => (series as typeof series & { group: string })?.group.includes(' to '))) {
        const namedKnownSeries = knownSeries.map((series) => {
          const name = String((series as typeof series).data?.[0]);
          const color = groupColorScale?.(name as string) ?? VIS_NEUTRAL_COLOR;
          return {
            ...series,
            name,
            itemStyle: { color },
          };
        });
        return [...namedKnownSeries, ...unknownSeries];
      }

      const sortedSeries = knownSeries.sort((a, b) => {
        if (!(a as typeof a & { group: string }).group.includes(' to ')) {
          return 0;
        }
        const [aMin, aMax] = (a as typeof a & { group: string }).group.split(' to ').map(Number);
        const [bMin, bMax] = (b as typeof b & { group: string }).group.split(' to ').map(Number);
        return (aMin as number) - (bMin as number) || (aMax as number) - (bMax as number);
      });
      return [...sortedSeries, ...unknownSeries];
    }
    return [...knownSeries, ...unknownSeries];
  }, [groupColorScale, isGroupedByNumerical, visState.series]);

  // NOTE: @dv-usama-ansari: Prepare the base series options for the bar chart.
  const seriesBase = React.useMemo(
    () =>
      ({
        type: 'bar',
        blur: { label: { show: false } },
        barMaxWidth: BAR_WIDTH,
        barMinWidth: config?.useResponsiveBarWidth ? 1 : BAR_WIDTH,

        tooltip: {
          trigger: 'item',
          show: true,
          confine: true,
          backgroundColor: 'var(--tooltip-bg,var(--mantine-color-gray-9))',
          borderWidth: 0,
          borderColor: 'transparent',
          textStyle: {
            color: 'var(--tooltip-color,var(--mantine-color-white))',
          },
          axisPointer: {
            type: 'shadow',
          },
          // NOTE: @dv-usama-ansari: This function is a performance bottleneck.
          formatter: (params) => {
            const facetString = selectedFacetValue ? generateHTMLString({ label: `Facet of ${config?.facets?.name}`, value: selectedFacetValue }) : '';

            const groupString = (() => {
              if (config?.group) {
                const label = `Group of ${config?.group.name}`;
                const sanitizedSeriesName = sanitize(params.seriesName as string);
                const name =
                  sanitizedSeriesName === SERIES_ZERO
                    ? config?.group?.id === config?.facets?.id
                      ? (selectedFacetValue as string)
                      : aggregatedData?.groupingsList.length === 1
                        ? (aggregatedData?.groupingsList[0] as string)
                        : params.name
                    : sanitizedSeriesName;
                const color =
                  sanitizedSeriesName === NAN_REPLACEMENT
                    ? VIS_NEUTRAL_COLOR
                    : config?.group?.id === config?.facets?.id
                      ? selectedFacetValue === NAN_REPLACEMENT
                        ? VIS_NEUTRAL_COLOR
                        : (groupColorScale?.(selectedFacetValue as string) ?? VIS_NEUTRAL_COLOR)
                      : (groupColorScale?.(name as string) ?? VIS_NEUTRAL_COLOR);

                if (isGroupedByNumerical) {
                  if (sanitizedSeriesName === NAN_REPLACEMENT) {
                    return generateHTMLString({ label, value: name, color });
                  }
                  if (!name.includes(' to ')) {
                    return generateHTMLString({ label, value: name, color });
                  }
                  const [min, max] = (name ?? '0 to 0').split(' to ');
                  if (!Number.isNaN(Number(min)) && !Number.isNaN(Number(max))) {
                    const formattedMin = numberFormatter.format(Number(min));
                    const formattedMax = numberFormatter.format(Number(max));
                    return generateHTMLString({ label, value: `${formattedMin} to ${formattedMax}`, color });
                  }
                  return generateHTMLString({ label, value: params.value as string, color });
                }
                return generateHTMLString({ label, value: name, color });
              }
              return '';
            })();

            const aggregateString = generateHTMLString({
              label:
                config?.aggregateType === EAggregateTypes.COUNT
                  ? config?.display === EBarDisplayType.NORMALIZED
                    ? `Normalized ${config?.aggregateType}`
                    : config?.aggregateType
                  : `${config?.aggregateType} of ${config?.aggregateColumn?.name}`,
              value: config?.display === EBarDisplayType.NORMALIZED ? `${params.value}%` : (params.value as string),
            });

            const nonNormalizedString =
              config?.display === EBarDisplayType.NORMALIZED
                ? generateHTMLString({
                    label: config?.aggregateType,
                    value:
                      // NOTE: @dv-usama-ansari: Count is undefined for 100% bars, therefore we need to use a different approach
                      params?.value === 100
                        ? String(
                            aggregatedData?.categories[params.name]?.groups[Object.keys(aggregatedData?.categories[params.name]?.groups ?? {})[0] as string]
                              ?.total,
                          )
                        : (String(aggregatedData?.categories[params.name]?.groups[params.seriesName as string]?.total) ?? ''),
                  })
                : '';

            const categoryString = generateHTMLString({ label: config?.catColumnSelected?.name as string, value: params.name });

            const tooltipGrid = `<div style="display: grid; grid-template-rows: 1fr">${categoryString}${nonNormalizedString}${aggregateString}${facetString}${groupString}</div>`;
            return tooltipGrid;
          },
        },

        label: {
          show: true,
          // NOTE: @dv-usama-ansari: This function is a performance bottleneck.
          formatter: (params) =>
            config?.group && config?.groupType === EBarGroupingType.STACK && config?.display === EBarDisplayType.NORMALIZED
              ? `${params.value}%`
              : String(params.value),
        },

        labelLayout: {
          hideOverlap: true,
        },

        sampling: 'average',
        large: true,

        // enable click events on bars -> handled by chartInstance callback in `useChart.mouseEvents.click`
        triggerEvent: true,

        clip: false,
        catColumnSelected: config?.catColumnSelected,
        group: config?.group,
      }) as BarSeriesOption,
    [
      config?.useResponsiveBarWidth,
      config?.catColumnSelected,
      config?.group,
      config?.facets?.name,
      config?.facets?.id,
      config?.aggregateType,
      config?.display,
      config?.aggregateColumn?.name,
      config?.groupType,
      selectedFacetValue,
      aggregatedData?.categories,
      aggregatedData?.groupingsList,
      groupColorScale,
      isGroupedByNumerical,
    ],
  );

  const optionBase = React.useMemo(
    () =>
      ({
        animation: false,

        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },

        title: [
          {
            text: selectedFacetValue
              ? `${config?.facets?.name}: ${selectedFacetValue} | ${config?.aggregateType === EAggregateTypes.COUNT ? config?.aggregateType : `${config?.aggregateType} of ${config?.aggregateColumn?.name}`}: ${config?.catColumnSelected?.name}`
              : `${config?.aggregateType === EAggregateTypes.COUNT ? config?.aggregateType : `${config?.aggregateType} of ${config?.aggregateColumn?.name}`}: ${config?.catColumnSelected?.name}`,
            triggerEvent: !!config?.facets,
            left: '50%',
            textAlign: 'center',
            name: 'facetTitle',
            textStyle: {
              color: '#7F7F7F',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
              whiteSpace: 'pre',
            },
          },
        ],

        grid: {
          containLabel: false,
          left: config?.direction === EBarDirection.HORIZONTAL ? Math.min(gridLeft, containerWidth / 3) : 60, // NOTE: @dv-usama-ansari: Arbitrary fallback value!
          top: config?.direction === EBarDirection.HORIZONTAL ? 55 : 70, // NOTE: @dv-usama-ansari: Arbitrary value!
          bottom: config?.direction === EBarDirection.HORIZONTAL ? 55 : 85, // NOTE: @dv-usama-ansari: Arbitrary value!
          right: 20, // NOTE: @dv-usama-ansari: Arbitrary value!
        },

        legend: {
          orient: 'horizontal',
          top: 30,
          type: 'scroll',
          icon: 'circle',
          show: !!config?.group,
          data: config?.group
            ? groupSortedSeries.map((seriesItem) => ({
                name: seriesItem.name,
                itemStyle: { color: seriesItem.name === NAN_REPLACEMENT ? VIS_NEUTRAL_COLOR : groupColorScale?.(seriesItem.name as string) },
              }))
            : [],
          // NOTE: @dv-usama-ansari: This function is a performance bottleneck.
          formatter: (name: string) => {
            if (isGroupedByNumerical) {
              if (name === NAN_REPLACEMENT && !name.includes(' to ')) {
                return name;
              }
              const [min, max] = name.split(' to ');
              const formattedMin = numberFormatter.format(Number(min));
              if (max) {
                const formattedMax = numberFormatter.format(Number(max));
                return `${formattedMin} to ${formattedMax}`;
              }
              return formattedMin;
            }
            return name;
          },
        },
      }) as ECOption,
    [
      config?.aggregateColumn?.name,
      config?.aggregateType,
      config?.catColumnSelected?.name,
      config?.direction,
      config?.facets,
      config?.group,
      containerWidth,
      gridLeft,
      groupColorScale,
      groupSortedSeries,
      isGroupedByNumerical,
      selectedFacetValue,
    ],
  );

  const options = React.useMemo(
    () =>
      ({
        ...optionBase,
        series: groupSortedSeries,
        xAxis: visState.xAxis,
        yAxis: visState.yAxis,
      }) as ECOption,
    [groupSortedSeries, optionBase, visState.xAxis, visState.yAxis],
  );

  const settings = React.useMemo(
    () => ({
      notMerge: true,
    }),
    [],
  );

  // NOTE: @dv-usama-ansari: Tooltip implementation from: https://codepen.io/plainheart/pen/jOGBrmJ
  const axisLabelTooltip = React.useMemo(() => {
    const dom = document.createElement('div');
    dom.id = 'axis-tooltip';
    dom.style.position = 'absolute';
    dom.style.backgroundColor = 'rgba(50,50,50)';
    dom.style.borderRadius = '4px';
    dom.style.color = '#FFFFFF';
    dom.style.fontFamily = 'sans-serif';
    dom.style.fontSize = '14px';
    dom.style.opacity = '0';
    dom.style.padding = '4px 8px';
    dom.style.transformOrigin = 'bottom';
    dom.style.visibility = 'hidden';
    dom.style.zIndex = '9999';
    dom.style.transition = 'opacity 400ms';

    const content = document.createElement('div');
    dom.appendChild(content);

    return { dom, content };
  }, []);

  const { setRef, instance } = useChart({
    options,
    settings,
    mouseEvents: {
      click: [
        {
          query: { titleIndex: 0 },
          handler: () => {
            setConfig?.({ ...config!, focusFacetIndex: config?.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
          },
        },
        {
          query: { seriesType: 'bar' },
          handler: (params) => {
            const event = params.event?.event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>;
            // NOTE: @dv-usama-ansari: Sanitization is required here since the seriesName contains \u000 which make github confused.
            const seriesName = sanitize(params.seriesName ?? '') === SERIES_ZERO ? params.name : params.seriesName;
            const ids: string[] = config?.group
              ? config.group.id === config?.facets?.id
                ? [
                    ...(aggregatedData?.categories[params.name]?.groups[selectedFacetValue!]?.unselected.ids ?? []),
                    ...(aggregatedData?.categories[params.name]?.groups[selectedFacetValue!]?.selected.ids ?? []),
                  ]
                : [
                    ...(aggregatedData?.categories[params.name]?.groups[seriesName as string]?.unselected.ids ?? []),
                    ...(aggregatedData?.categories[params.name]?.groups[seriesName as string]?.selected.ids ?? []),
                  ]
              : (aggregatedData?.categories[params.name]?.ids ?? []);

            if (event.shiftKey) {
              // NOTE: @dv-usama-ansari: `shift + click` on a bar which is already selected will deselect it.
              //  Using `Set` to reduce time complexity to O(1).
              const newSelectedSet = new Set(selectedList);
              ids.forEach((id) => {
                if (newSelectedSet.has(id)) {
                  newSelectedSet.delete(id);
                } else {
                  newSelectedSet.add(id);
                }
              });
              const newSelectedList = [...newSelectedSet];
              selectionCallback(event, [...new Set([...newSelectedList])]);
            } else {
              // NOTE: @dv-usama-ansari: Early return if the bar is clicked and it is already selected?
              const isSameBarClicked = (selectedList ?? []).length > 0 && (selectedList ?? []).every((id) => ids.includes(id));
              selectionCallback(event, isSameBarClicked ? [] : ids);
            }
          },
        },
        {
          query:
            config?.direction === EBarDirection.HORIZONTAL
              ? { componentType: 'yAxis' }
              : config?.direction === EBarDirection.VERTICAL
                ? { componentType: 'xAxis' }
                : { componentType: 'unknown' }, // No event should be triggered when the direction is not set.

          handler: (params) => {
            if (params.targetType === 'axisLabel') {
              const event = params.event?.event as unknown as React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>;
              const ids = aggregatedData?.categories[params.value as string]?.ids ?? [];
              if (event.shiftKey) {
                const newSelectedSet = new Set(selectedList);
                ids.forEach((id) => {
                  if (newSelectedSet.has(id)) {
                    newSelectedSet.delete(id);
                  } else {
                    newSelectedSet.add(id);
                  }
                });
                const newSelectedList = [...newSelectedSet];
                selectionCallback(event, [...new Set([...newSelectedList])]);
              } else {
                const isSameBarClicked = (selectedList ?? []).length > 0 && (selectedList ?? []).every((id) => ids.includes(id));
                selectionCallback(event, isSameBarClicked ? [] : ids);
              }
            }
          },
        },
        {
          query: { componentType: 'yAxis' },
          handler: (params) => {
            if (params.targetType === 'axisName' && params.componentType === 'yAxis') {
              if (config?.direction === EBarDirection.HORIZONTAL) {
                const sortMetadata = getSortMetadata(EBarSortParameters.CATEGORIES);
                setConfig?.({ ...config!, sortState: sortMetadata.nextSortState });
              }
              if (config?.direction === EBarDirection.VERTICAL) {
                const sortMetadata = getSortMetadata(EBarSortParameters.AGGREGATION);
                setConfig?.({ ...config!, sortState: sortMetadata.nextSortState });
              }
            }
          },
        },
        {
          query: { componentType: 'xAxis' },
          handler: (params) => {
            if (params.targetType === 'axisName' && params.componentType === 'xAxis') {
              if (config?.direction === EBarDirection.HORIZONTAL) {
                const sortMetadata = getSortMetadata(EBarSortParameters.AGGREGATION);
                setConfig?.({ ...config!, sortState: sortMetadata.nextSortState });
              }
              if (config?.direction === EBarDirection.VERTICAL) {
                const sortMetadata = getSortMetadata(EBarSortParameters.CATEGORIES);
                setConfig?.({ ...config!, sortState: sortMetadata.nextSortState });
              }
            }
          },
        },
      ],
      mouseover: [
        {
          query:
            config?.direction === EBarDirection.HORIZONTAL
              ? { componentType: 'yAxis' }
              : config?.direction === EBarDirection.VERTICAL
                ? { componentType: 'xAxis' }
                : { componentType: 'unknown' }, // No event should be triggered when the direction is not set.
          handler: (params) => {
            if (params.targetType === 'axisLabel') {
              const currLabel = params.event?.target;
              const fullText = params.value;
              const displayText = (currLabel as typeof currLabel & { style: { text: string } }).style.text;
              if (config?.direction === EBarDirection.VERTICAL || fullText !== displayText) {
                axisLabelTooltip.content.innerText = fullText as string;
                axisLabelTooltip.dom.style.opacity = '1';
                axisLabelTooltip.dom.style.visibility = 'visible';
                axisLabelTooltip.dom.style.zIndex = '9999';

                const topOffset =
                  config?.direction === EBarDirection.HORIZONTAL
                    ? axisLabelTooltip.dom.offsetHeight * -1.5
                    : config?.direction === EBarDirection.VERTICAL
                      ? axisLabelTooltip.dom.offsetHeight * -1.25
                      : 0;
                const top = (currLabel?.transform[5] ?? 0) + topOffset;
                const leftOffset =
                  config?.direction === EBarDirection.HORIZONTAL
                    ? axisLabelTooltip.dom.offsetWidth * -1
                    : config?.direction === EBarDirection.VERTICAL
                      ? axisLabelTooltip.dom.offsetWidth * -0.5
                      : 0;
                const left = Math.max((currLabel?.transform[4] ?? 0) + leftOffset, 0);
                axisLabelTooltip.dom.style.top = `${top}px`;
                axisLabelTooltip.dom.style.left = `${left}px`;
              }
            }
          },
        },
      ],
      mouseout: [
        {
          query:
            config?.direction === EBarDirection.HORIZONTAL
              ? { componentType: 'yAxis' }
              : config?.direction === EBarDirection.VERTICAL
                ? { componentType: 'xAxis' }
                : { componentType: 'unknown' }, // No event should be triggered when the direction is not set.
          handler: (params) => {
            if (params.targetType === 'axisLabel') {
              axisLabelTooltip.dom.style.opacity = '0';
              axisLabelTooltip.dom.style.visibility = 'hidden';
              axisLabelTooltip.dom.style.zIndex = '-1';
            }
          },
        },
      ],
    },
  });

  const isLoading = React.useMemo(
    () => (visState.series.length === 0 ? generateBarSeriesStatus === 'pending' : false),
    [generateBarSeriesStatus, visState.series.length],
  );
  const isError = React.useMemo(() => generateBarSeriesStatus === 'error', [generateBarSeriesStatus]);
  const isSuccess = React.useMemo(() => visState.series.length > 0, [visState.series.length]);

  const updateSortSideEffect = React.useCallback(
    ({ barSeries = [] }: { barSeries: (BarSeriesOption & { categories: string[] })[] }) => {
      if (barSeries.length > 0 || !aggregatedData) {
        if (config?.direction === EBarDirection.HORIZONTAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => (item ? { categories: item.categories, data: item.data } : null)),
            { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.HORIZONTAL },
          );
          setVisState((v) => ({
            ...v,
            // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
            series: barSeries.map((item, itemIndex) => ({
              ...item,
              data: [...(sortedSeries[itemIndex]?.data as NonNullable<BarSeriesOption['data']>)].reverse(),
            })),
            yAxis: {
              ...v.yAxis,
              type: 'category' as const,
              data: [...(sortedSeries[0]?.categories as string[])].reverse(),
            },
          }));
        }
        if (config?.direction === EBarDirection.VERTICAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => (item ? { categories: item.categories, data: item.data } : null)),
            { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.VERTICAL },
          );

          setVisState((v) => ({
            ...v,
            series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]?.data })),
            xAxis: { ...v.xAxis, type: 'category' as const, data: sortedSeries[0]?.categories },
          }));
        }
      }
    },
    [aggregatedData, config?.direction, config?.sortState, setVisState],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    if (visState.series.length === 0 || !aggregatedData) {
      return;
    }
    const aggregationAxisNameBase =
      config?.group && config?.display === EBarDisplayType.NORMALIZED
        ? `Normalized ${config?.aggregateType} (%)`
        : config?.aggregateType === EAggregateTypes.COUNT
          ? config?.aggregateType
          : `${config?.aggregateType} of ${config?.aggregateColumn?.name}`;
    const aggregationAxisDescription = config?.showColumnDescriptionText
      ? config?.aggregateColumn?.description && config?.aggregateType !== EAggregateTypes.COUNT
        ? `: ${config?.aggregateColumn?.description}`
        : ''
      : '';
    const aggregationAxisSortText =
      config?.direction === EBarDirection.HORIZONTAL
        ? SortDirectionMap[config?.sortState?.x as EBarSortState]
        : config?.direction === EBarDirection.VERTICAL
          ? SortDirectionMap[config?.sortState?.y as EBarSortState]
          : '';
    const aggregationAxisName = `${aggregationAxisNameBase}${aggregationAxisDescription} (${aggregationAxisSortText})`;

    const categoricalAxisNameBase = config?.catColumnSelected?.name;
    const categoricalAxisDescription = config?.showColumnDescriptionText
      ? config?.catColumnSelected?.description
        ? `: ${config?.catColumnSelected?.description}`
        : ''
      : '';
    const categoricalAxisSortText =
      config?.direction === EBarDirection.HORIZONTAL
        ? SortDirectionMap[config?.sortState?.y as EBarSortState]
        : config?.direction === EBarDirection.VERTICAL
          ? SortDirectionMap[config?.sortState?.x as EBarSortState]
          : '';
    const categoricalAxisName = `${categoricalAxisNameBase}${categoricalAxisDescription} (${categoricalAxisSortText})`;

    if (config?.direction === EBarDirection.HORIZONTAL) {
      setVisState((v) => ({
        ...v,

        xAxis: {
          type: 'value' as const,
          name: aggregationAxisName,
          nameLocation: 'middle',
          nameGap: 32,
          min: globalMin ?? 'dataMin',
          max: globalMax ?? 'dataMax',
          axisLabel: {
            hideOverlap: true,
            formatter: (value: number) => numberFormatter.format(value),
          },
          nameTextStyle: {
            color: aggregationAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
          },
          triggerEvent: true,
        },

        yAxis: {
          type: 'category' as const,
          name: categoricalAxisName,
          nameLocation: 'middle',
          nameGap: Math.min(gridLeft, containerWidth / 3) - 20,
          data: (v.yAxis as { data: number[] })?.data ?? [],
          axisLabel: {
            show: true,
            width: gridLeft - 20,
            formatter: (value: string) => labelsMap[value],
          },
          nameTextStyle: {
            color: categoricalAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
          },
          triggerEvent: true,
        },
      }));
    }
    if (config?.direction === EBarDirection.VERTICAL) {
      setVisState((v) => ({
        ...v,

        // NOTE: @dv-usama-ansari: xAxis is not showing labels as expected for the vertical bar chart.
        xAxis: {
          type: 'category' as const,
          name: categoricalAxisName,
          nameLocation: 'middle',
          nameGap: 60,
          data: (v.xAxis as { data: number[] })?.data ?? [],
          axisLabel: {
            show: true,
            formatter: (value: string) => labelsMap[value],
            rotate: 45,
          },
          nameTextStyle: {
            color: categoricalAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
          },
          triggerEvent: true,
        },

        yAxis: {
          type: 'value' as const,
          name: aggregationAxisName,
          nameLocation: 'middle',
          nameGap: 40,
          min: globalMin ?? 'dataMin',
          max: globalMax ?? 'dataMax',
          axisLabel: {
            hideOverlap: true,
            formatter: (value: number) => numberFormatter.format(value),
          },
          nameTextStyle: {
            color: aggregationAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
          },
          triggerEvent: true,
        },
      }));
    }
  }, [
    aggregatedData,
    config?.aggregateColumn?.description,
    config?.aggregateColumn?.name,
    config?.aggregateType,
    config?.catColumnSelected?.description,
    config?.catColumnSelected?.name,
    config?.direction,
    config?.display,
    config?.group,
    config?.showColumnDescriptionText,
    config?.sortState?.x,
    config?.sortState?.y,
    containerWidth,
    globalMax,
    globalMin,
    gridLeft,
    labelsMap,
    setVisState,
    visState.series.length,
  ]);

  const updateCategoriesSideEffect = React.useCallback(async () => {
    if (aggregatedData) {
      const result = await generateBarSeriesTrigger(aggregatedData, {
        aggregateType: config?.aggregateType as EAggregateTypes,
        display: config?.display as EBarDisplayType,
        facets: config?.facets as ColumnInfo,
        group: config?.group as ColumnInfo,
        groupType: config?.groupType as EBarGroupingType,
      });

      const barSeries = result.map((series) => {
        if (!series) {
          return series;
        }
        const r = series as typeof series & { selected: 'selected' | 'unselected'; group: string };
        const isGrouped = config?.group && groupColorScale != null;
        const isSelected = r.selected === 'selected';
        const shouldLowerOpacity = hasSelected && isGrouped && !isSelected;
        const lowerBarOpacity = shouldLowerOpacity ? { opacity: VIS_UNSELECTED_OPACITY } : {};
        const fixLabelColor = shouldLowerOpacity ? { opacity: 0.5, color: DEFAULT_COLOR } : {};
        return {
          ...seriesBase,
          ...r,
          label: {
            ...seriesBase.label,
            ...r.label,
            ...fixLabelColor,
          },
          large: true,
          itemStyle: {
            ...seriesBase.itemStyle,
            ...r.itemStyle,
            ...lowerBarOpacity,
            color:
              r.group === NAN_REPLACEMENT
                ? isSelected
                  ? SELECT_COLOR
                  : VIS_NEUTRAL_COLOR
                : isGrouped
                  ? groupColorScale(r.group) || VIS_NEUTRAL_COLOR
                  : VIS_NEUTRAL_COLOR,
          },
        };
      });

      updateSortSideEffect({ barSeries });
      updateDirectionSideEffect();
    }
  }, [
    aggregatedData,
    seriesBase,
    config?.aggregateType,
    config?.display,
    config?.facets,
    config?.group,
    config?.groupType,
    generateBarSeriesTrigger,
    groupColorScale,
    hasSelected,
    updateDirectionSideEffect,
    updateSortSideEffect,
  ]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the direction of the bar chart changes.
  React.useEffect(() => {
    updateDirectionSideEffect();
  }, [config?.direction, updateDirectionSideEffect]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the selected categorical column changes.
  React.useEffect(() => {
    updateCategoriesSideEffect();
  }, [config?.catColumnSelected?.id, selectedMap, updateCategoriesSideEffect]);

  React.useEffect(() => {
    if (instance && instance.getDom() && !instance?.getDom()?.querySelector('#axis-tooltip')) {
      instance.getDom().appendChild(axisLabelTooltip.dom);
    }
  }, [axisLabelTooltip.dom, instance]);

  return isLoading ? (
    <BlurredOverlay
      loading
      visible
      dataTestId="visyn-bar-chart-config-setup-facet-overlay"
      loadingText={
        config?.facets && selectedFacetValue
          ? `Setting up your chart for facet "${selectedFacetValue}", almost ready ...`
          : 'Setting up your chart, almost ready ...'
      }
    />
  ) : isError ? (
    <Stack mih={DEFAULT_BAR_CHART_HEIGHT} align="center" justify="center" data-test-id="visyn-bar-chart-config-setup-error">
      {config?.facets && selectedFacetValue ? <Text style={{ textAlign: 'center' }}>{selectedFacetValue}</Text> : null}
      <ErrorMessage dataTestId="visyn-vis-bar-chart-setup-chart-error">Something went wrong setting up your chart.</ErrorMessage>
    </Stack>
  ) : (
    isSuccess &&
    (groupSortedSeries.length === 0 ? (
      config?.facets && selectedFacetValue ? (
        <Stack mih={DEFAULT_BAR_CHART_HEIGHT} align="center" justify="center" data-test-id={`visyn-bar-chart-no-data-error-facet-${selectedFacetValue}`}>
          <Text style={{ textAlign: 'center' }}>{selectedFacetValue}</Text>
          <WarningMessage dataTestId={`visyn-vis-bar-chart-no-data-facet-${selectedFacetValue}-warning`}>No data available for this facet.</WarningMessage>
        </Stack>
      ) : (
        <Stack mih={DEFAULT_BAR_CHART_HEIGHT} align="center" justify="center" data-test-id="visyn-bar-chart-no-data-error">
          <WarningMessage dataTestId="visyn-vis-bar-chart-no-data-warning">No data available for this chart. Try a different configuration.</WarningMessage>
        </Stack>
      )
    ) : !(visState.xAxis && visState.yAxis) ? null : (
      options && (
        <Box
          component="div"
          pos="relative"
          pr="xs"
          ref={setRef}
          style={{
            width: `${Math.max(containerWidth, chartMinWidth)}px`,
            height: `${chartHeight + CHART_HEIGHT_MARGIN}px`,
          }}
        />
      )
    ))
  );
}

export const SingleEChartsBarChart = React.memo(EagerSingleEChartsBarChart);
