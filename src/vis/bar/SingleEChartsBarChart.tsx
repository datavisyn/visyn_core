import * as React from 'react';

import { Box, Stack, Text } from '@mantine/core';
import { usePrevious } from '@mantine/hooks';
import type { ScaleOrdinal } from 'd3v7';
import type { BarSeriesOption } from 'echarts/charts';

import { BlurredOverlay } from '../../components';
import { type ECOption, useChart } from '../../echarts';
import { sanitize } from '../../utils';
import { ErrorMessage } from '../general/ErrorMessage';
import { WarningMessage } from '../general/WarningMessage';
import { NAN_REPLACEMENT, VIS_NEUTRAL_COLOR } from '../general/constants';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { useGetBarChartMouseEvents, useGetBarVisState } from './hooks';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './interfaces';
import { AggregatedDataType, BAR_WIDTH, CHART_HEIGHT_MARGIN, DEFAULT_BAR_CHART_HEIGHT, SERIES_ZERO } from './interfaces/internal';
import { numberFormatter } from './utils';

function generateHTMLString({ label, value, color }: { label: string; value: string; color?: string }): string {
  return `<div style="display: flex; gap: 8px">
  <div><span>${label}:</span></div>
  <div style="display: flex; flex-wrap: nowrap; align-items: center; gap: 8px">
    <div><span style="font-weight: bold">${value}</span></div>
    ${color ? `<div style="width: 12px; height: 12px; border-radius: 12px; background-color: ${color};" />` : ''}
  </div>
</div>`;
}

function EagerSingleEChartsBarChart({
  aggregatedData,
  config,
  containerWidth,
  dimensions,
  globalMax,
  globalMin,
  groupColorScale,
  isGroupedByNumerical,
  isParentLoading,
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
  containerWidth: number;
  dimensions: { height: number; minWidth: number };
  globalMax?: number;
  globalMin?: number;
  groupColorScale: ScaleOrdinal<string, string, never>;
  isGroupedByNumerical: boolean;
  isParentLoading: boolean;
  labelsMap: Record<string, string>;
  longestLabelWidth: number;
  selectedFacetIndex?: number;
  selectedFacetValue?: string;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
}) {
  // const catColumnSelectedRef = React.useRef<string | null>(config?.catColumnSelected?.id ?? null);
  const previousCatColumn = usePrevious(config?.catColumnSelected?.id);
  const isCatColumnChanged = React.useMemo(() => previousCatColumn !== config?.catColumnSelected?.id, [config?.catColumnSelected?.id, previousCatColumn]);

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

  const hasSelected = React.useMemo(() => (selectedMap ? Object.values(selectedMap).some((selected) => selected) : false), [selectedMap]);
  const gridLeft = React.useMemo(() => Math.min(longestLabelWidth + 20, containerWidth / 3), [containerWidth, longestLabelWidth]);

  const { isError, isLoading, isSuccess, visState, yAxisLabel, setYAxisLabel } = useGetBarVisState({
    aggregatedData,
    config: config!,
    containerWidth,
    globalMax,
    globalMin,
    gridLeft,
    groupColorScale,
    hasSelected,
    isGroupedByNumerical,
    labelsMap,
    seriesBase,
  });

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
          bottom: config?.direction === EBarDirection.HORIZONTAL ? 55 : 125, // NOTE: @dv-usama-ansari: Arbitrary value!
          right: 20, // NOTE: @dv-usama-ansari: Arbitrary value!
        },

        legend: {
          orient: 'horizontal',
          top: 30,
          type: 'scroll',
          icon: 'circle',
          show: !!config?.group,
          data: config?.group
            ? visState.series.map((seriesItem) => ({
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
      isGroupedByNumerical,
      selectedFacetValue,
      visState.series,
    ],
  );

  const options = React.useMemo(
    () =>
      ({
        ...optionBase,
        series: visState.series,
        xAxis: visState.xAxis,
        yAxis: visState.yAxis,
      }) as ECOption,
    [optionBase, visState.series, visState.xAxis, visState.yAxis],
  );

  const settings = React.useMemo(
    () => ({
      notMerge: true,
    }),
    [],
  );

  // NOTE: @dv-usama-ansari: Create an offscreen canvas to measure the text width.
  const canvasContext = React.useMemo(() => new OffscreenCanvas(1, 1).getContext('2d'), []);

  // NOTE: @dv-usama-ansari: Tooltip implementation from: https://codepen.io/plainheart/pen/jOGBrmJ
  //  This element should be used to display tooltips which are not provided by echarts out of the box.
  const customTooltip = React.useMemo(() => {
    const dom = document.createElement('div');
    dom.id = 'axis-ticks-tooltip';
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

  React.useEffect(() => {
    if (yAxisLabel) {
      customTooltip.content.innerText = yAxisLabel ?? '';
    }
  }, [customTooltip.content, yAxisLabel]);

  const { click } = useGetBarChartMouseEvents({ aggregatedData, config, selectedFacetIndex, selectedFacetValue, selectedList, selectionCallback, setConfig });

  const { setRef, instance } = useChart({
    options,
    settings,
    mouseEvents: {
      click,
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
                customTooltip.content.innerText = fullText as string;
                customTooltip.dom.style.opacity = '1';
                customTooltip.dom.style.visibility = 'visible';
                customTooltip.dom.style.zIndex = '9999';

                const topOffset =
                  config?.direction === EBarDirection.HORIZONTAL
                    ? customTooltip.dom.offsetHeight * -1.5
                    : config?.direction === EBarDirection.VERTICAL
                      ? customTooltip.dom.offsetHeight * -1.25
                      : 0;
                const top = (currLabel?.transform[5] ?? 0) + topOffset;
                const leftOffset =
                  config?.direction === EBarDirection.HORIZONTAL
                    ? customTooltip.dom.offsetWidth * -1
                    : config?.direction === EBarDirection.VERTICAL
                      ? customTooltip.dom.offsetWidth * -0.5
                      : 0;
                const left = Math.max((currLabel?.transform[4] ?? 0) + leftOffset, 0);
                customTooltip.dom.style.top = `${top}px`;
                customTooltip.dom.style.left = `${left}px`;
              }
            }
          },
        },
        {
          query: { componentType: 'yAxis' },
          handler: (params) => {
            if (params.targetType === 'axisName') {
              setYAxisLabel(params.name as string);
              let fullTextWidth = 0;

              if (canvasContext) {
                // NOTE: @dv-usama-ansari: This is the default font for ECharts axis labels.
                canvasContext.font = 'normal normal 12px sans-serif';
                canvasContext.textAlign = 'left';
                canvasContext.textBaseline = 'top';

                // NOTE: @dv-usama-ansari: Measure the width of the full text in an offscreen canvas.
                fullTextWidth = canvasContext.measureText(yAxisLabel).width;
              }

              // NOTE: @dv-usama-ansari: Display the tooltip only if it overflows the chart height.
              if (fullTextWidth > dimensions.height + CHART_HEIGHT_MARGIN) {
                customTooltip.content.innerText = yAxisLabel as string;
                customTooltip.dom.style.opacity = '1';
                customTooltip.dom.style.visibility = 'visible';
                customTooltip.dom.style.zIndex = '9999';

                const top = (dimensions.height + CHART_HEIGHT_MARGIN) / 2;
                const left = 24;
                customTooltip.dom.style.top = `${top}px`;
                customTooltip.dom.style.left = `${left}px`;
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
              customTooltip.dom.style.opacity = '0';
              customTooltip.dom.style.visibility = 'hidden';
              customTooltip.dom.style.zIndex = '-1';
            }
          },
        },
        {
          query: { componentType: 'yAxis' },
          handler: (params) => {
            if (params.targetType === 'axisName') {
              customTooltip.dom.style.opacity = '0';
              customTooltip.dom.style.visibility = 'hidden';
              customTooltip.dom.style.zIndex = '-1';
            }
          },
        },
      ],
    },
  });

  React.useEffect(() => {
    if (instance && instance.getDom() && !instance?.getDom()?.querySelector('#axis-tooltip')) {
      instance.getDom().appendChild(customTooltip.dom);
    }
  }, [customTooltip.dom, instance]);

  return !isCatColumnChanged ? (
    isLoading || isParentLoading ? (
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
    ) : null
  ) : isError ? (
    <Stack mih={DEFAULT_BAR_CHART_HEIGHT} align="center" justify="center" data-test-id="visyn-bar-chart-config-setup-error">
      {config?.facets && selectedFacetValue ? <Text style={{ textAlign: 'center' }}>{selectedFacetValue}</Text> : null}
      <ErrorMessage dataTestId="visyn-vis-bar-chart-setup-chart-error">Something went wrong setting up your chart.</ErrorMessage>
    </Stack>
  ) : (
    isSuccess &&
    (visState.series.length === 0 ? (
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
    ) : (
      visState?.xAxis &&
      visState?.yAxis &&
      options &&
      dimensions.height > 0 && (
        <Box
          component="div"
          pos="relative"
          pr="xs"
          ref={setRef}
          style={{
            width: `${Math.max(containerWidth, dimensions.minWidth)}px`,
            height: `${dimensions.height + CHART_HEIGHT_MARGIN}px`,
          }}
        />
      )
    ))
  );
}

export const SingleEChartsBarChart = React.memo(EagerSingleEChartsBarChart);
