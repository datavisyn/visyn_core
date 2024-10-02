import { Box } from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import { type ScaleOrdinal } from 'd3v7';
import { EChartsOption } from 'echarts';
import type { BarSeriesOption } from 'echarts/charts';
import * as React from 'react';
import { selectionColorDark } from '../../utils';
import { DEFAULT_COLOR, NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../general';
import { EAggregateTypes, ICommonVisProps } from '../interfaces';
import { useChart } from '../vishooks/hooks/useChart';
import { useBarSortHelper } from './hooks';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortParameters, EBarSortState, IBarConfig, SortDirectionMap } from './interfaces';
import { AggregatedDataType, BAR_WIDTH, CHART_HEIGHT_MARGIN, median, normalizedValue, sortSeries } from './interfaces/internal';

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
  const [visState, setVisState] = useSetState({
    series: [] as BarSeriesOption[],
    xAxis: null as EChartsOption['xAxis'] | null,
    yAxis: null as EChartsOption['yAxis'] | null,
  });

  const hasSelected = React.useMemo(() => (selectedMap ? Object.values(selectedMap).some((selected) => selected) : false), [selectedMap]);

  const gridLeft = React.useMemo(() => Math.min(longestLabelWidth + 20, containerWidth / 3), [containerWidth, longestLabelWidth]);

  const getDataForAggregationType = React.useCallback(
    (group: string, selected: 'selected' | 'unselected') => {
      if (aggregatedData) {
        switch (config?.aggregateType) {
          case EAggregateTypes.COUNT:
            return (aggregatedData.categoriesList ?? []).map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].count,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.AVG:
            return (aggregatedData.categoriesList ?? []).map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].sum / aggregatedData.categories[category].groups[group][selected].count,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.MIN:
            return (aggregatedData.categoriesList ?? []).map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].min,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.MAX:
            return (aggregatedData.categoriesList ?? []).map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: aggregatedData.categories[category].groups[group][selected].max,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          case EAggregateTypes.MED:
            return (aggregatedData.categoriesList ?? []).map((category) => ({
              value: aggregatedData.categories[category]?.groups[group]?.[selected]
                ? normalizedValue({
                    config,
                    value: median(aggregatedData.categories[category].groups[group][selected].nums) as number,
                    total: aggregatedData.categories[category].total,
                  })
                : 0,
              category,
            }));

          default:
            console.warn(`Aggregation type ${config?.aggregateType} is not supported by bar chart.`);
            return [];
        }
      }
      console.warn(`No data available`);
      return null;
    },
    [aggregatedData, config],
  );

  // prepare data
  const barSeriesBase = React.useMemo(
    () =>
      ({
        type: 'bar',
        blur: { label: { show: false } },
        barMaxWidth: BAR_WIDTH,

        label: {
          show: true,
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
    [config?.catColumnSelected, config?.display, config?.group, config?.groupType],
  );

  const optionBase = React.useMemo(() => {
    return {
      animation: false,

      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
        },
        confine: true,
        backgroundColor: 'var(--tooltip-bg,var(--mantine-color-gray-9))',
        borderWidth: 0,
        borderColor: 'transparent',
        textStyle: {
          color: 'var(--tooltip-color,var(--mantine-color-white))',
        },
      },

      title: [
        {
          text: selectedFacetValue
            ? `${config?.facets?.name}: ${selectedFacetValue} | ${config?.catColumnSelected?.name} vs ${config?.aggregateType}`
            : `${config?.catColumnSelected?.name} vs ${config?.aggregateType === EAggregateTypes.COUNT ? config?.aggregateType : `${config?.aggregateType} of ${config?.aggregateColumn?.name}`}`,
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
        left: config?.direction === EBarDirection.HORIZONTAL ? Math.min(gridLeft, containerWidth / 3) : 60,
        top: config?.direction === EBarDirection.HORIZONTAL ? 55 : 70, // NOTE: @dv-usama-ansari: Arbitrary value!
        right: 40,
        bottom: config?.direction === EBarDirection.HORIZONTAL ? 55 : 70,
      },

      legend: {
        orient: 'horizontal',
        top: 30,
        type: 'scroll',
        icon: 'circle',
        show: !!config?.group,
        data: config?.group
          ? (visState.series ?? []).map((seriesItem) => ({
              name: seriesItem.name,
              itemStyle: {
                color: groupColorScale?.(seriesItem.name as string),
              },
            }))
          : [],
        formatter: (name: string) => {
          if (isGroupedByNumerical) {
            if (name === NAN_REPLACEMENT) {
              return name;
            }
            const [min, max] = name.split(' to ');
            // return `${round(Number(min), 4)} to ${round(Number(max), 4)}`;
            const formattedMin = new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 4,
              maximumSignificantDigits: 4,
              notation: 'compact',
              compactDisplay: 'short',
            }).format(Number(min));
            const formattedMax = new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 4,
              maximumSignificantDigits: 4,
              notation: 'compact',
              compactDisplay: 'short',
            }).format(Number(max));
            return `${formattedMin} to ${formattedMax}`;
          }
          return name;
        },
      },
    } as EChartsOption;
  }, [
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
  ]);

  const updateSortSideEffect = React.useCallback(
    ({ barSeries = [] }: { barSeries: (BarSeriesOption & { categories: string[] })[] }) => {
      if (barSeries.length > 0) {
        if (config?.direction === EBarDirection.HORIZONTAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.HORIZONTAL },
          );
          setVisState((v) => ({
            ...v,
            // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
            series: barSeries.map((item, itemIndex) => ({ ...item, data: [...sortedSeries[itemIndex]!.data!].reverse() })),
            yAxis: {
              ...v.yAxis,
              type: 'category' as const,
              data: [...(sortedSeries[0]?.categories as string[])].reverse(),
            },
          }));
        }
        if (config?.direction === EBarDirection.VERTICAL) {
          const sortedSeries = sortSeries(
            barSeries.map((item) => ({ categories: item.categories, data: item.data })),
            { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.VERTICAL },
          );

          setVisState((v) => ({
            ...v,
            series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]!.data })),
            xAxis: { ...v.xAxis, type: 'category' as const, data: sortedSeries[0]?.categories },
          }));
        }
      }
    },
    [config?.direction, config?.sortState, setVisState],
  );

  const updateDirectionSideEffect = React.useCallback(() => {
    const aggregationAxisNameBase =
      config?.group && config?.display === EBarDisplayType.NORMALIZED
        ? `Normalized ${config?.aggregateType} (%)`
        : config?.aggregateType === EAggregateTypes.COUNT
          ? config?.aggregateType
          : `${config?.aggregateType} of ${config?.aggregateColumn?.name}`;
    const aggregationAxisSortText =
      config?.direction === EBarDirection.HORIZONTAL
        ? SortDirectionMap[config?.sortState?.x as EBarSortState]
        : config?.direction === EBarDirection.VERTICAL
          ? SortDirectionMap[config?.sortState?.y as EBarSortState]
          : '';
    const aggregationAxisName = `${aggregationAxisNameBase} (${aggregationAxisSortText})`;

    const categoricalAxisNameBase = config?.catColumnSelected?.name;
    const categoricalAxisSortText =
      config?.direction === EBarDirection.HORIZONTAL
        ? SortDirectionMap[config?.sortState?.y as EBarSortState]
        : config?.direction === EBarDirection.VERTICAL
          ? SortDirectionMap[config?.sortState?.x as EBarSortState]
          : '';
    const categoricalAxisName = `${categoricalAxisNameBase} (${categoricalAxisSortText})`;

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
            formatter: (value: number) => {
              const formattedValue = new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 4,
                maximumSignificantDigits: 4,
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value);
              return formattedValue;
            },
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
            formatter: (value: string) => {
              const truncatedText = labelsMap[value];
              return truncatedText;
            },
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
            formatter: (value: string) => {
              const truncatedText = labelsMap[value];
              return truncatedText;
            },
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
            formatter: (value: number) => {
              const formattedValue = new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 4,
                maximumSignificantDigits: 4,
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value);
              return formattedValue;
            },
          },
          nameTextStyle: {
            color: aggregationAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
          },
          triggerEvent: true,
        },
      }));
    }
  }, [
    config?.aggregateColumn?.name,
    config?.aggregateType,
    config?.catColumnSelected?.name,
    config?.direction,
    config?.display,
    config?.group,
    config?.sortState?.x,
    config?.sortState?.y,
    containerWidth,
    globalMax,
    globalMin,
    gridLeft,
    labelsMap,
    setVisState,
  ]);

  const updateCategoriesSideEffect = React.useCallback(() => {
    const barSeries = (aggregatedData?.groupingsList ?? [])
      .map((g) => {
        return (['selected', 'unselected'] as const).map((s) => {
          const data = getDataForAggregationType(g, s);

          if (!data) {
            return null;
          }
          // avoid rendering empty series (bars for a group with all 0 values)
          if (data.every((d) => [Infinity, -Infinity].includes(d.value as number) || Number.isNaN(d.value))) {
            return null;
          }
          const isGrouped = config?.group && groupColorScale != null;
          const isSelected = s === 'selected';
          const shouldLowerOpacity = hasSelected && isGrouped && !isSelected;
          const lowerBarOpacity = shouldLowerOpacity ? { opacity: VIS_UNSELECTED_OPACITY } : {};
          const fixLabelColor = shouldLowerOpacity ? { opacity: 0.5, color: DEFAULT_COLOR } : {};
          return {
            ...barSeriesBase,
            name: aggregatedData?.groupingsList.length > 1 ? g : null,
            label: {
              ...barSeriesBase.label,
              ...fixLabelColor,
              show: true,
            },
            itemStyle: {
              color:
                g === NAN_REPLACEMENT
                  ? isSelected
                    ? SELECT_COLOR
                    : VIS_NEUTRAL_COLOR
                  : isGrouped
                    ? groupColorScale(g) || VIS_NEUTRAL_COLOR
                    : VIS_NEUTRAL_COLOR,

              ...lowerBarOpacity,
            },
            data: data.map((d) => (d.value === 0 ? null : d.value)) as number[],
            categories: data.map((d) => d.category),
            group: g,
            selected: s,

            // group = individual group names, stack = any fixed name
            stack: config?.groupType === EBarGroupingType.STACK ? 'total' : g,
          };
        });
      })
      .flat()
      .filter(Boolean) as (BarSeriesOption & { categories: string[] })[];

    updateSortSideEffect({ barSeries });
    updateDirectionSideEffect();
  }, [
    aggregatedData?.groupingsList,
    barSeriesBase,
    config?.group,
    config?.groupType,
    getDataForAggregationType,
    groupColorScale,
    hasSelected,
    updateDirectionSideEffect,
    updateSortSideEffect,
  ]);

  const options = React.useMemo(() => {
    return {
      ...optionBase,
      ...(visState.series ? { series: visState.series } : {}),
      ...(visState.xAxis ? { xAxis: visState.xAxis } : {}),
      ...(visState.yAxis ? { yAxis: visState.yAxis } : {}),
    } as EChartsOption;
  }, [visState.series, visState.xAxis, visState.yAxis, optionBase]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the direction of the bar chart changes.
  React.useEffect(() => {
    updateDirectionSideEffect();
  }, [config?.direction, updateDirectionSideEffect]);

  // NOTE: @dv-usama-ansari: This effect is used to update the series data when the selected categorical column changes.
  React.useEffect(() => {
    updateCategoriesSideEffect();
  }, [updateCategoriesSideEffect]);

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
    dom.style.backgroundColor = '#6E7079';
    dom.style.borderRadius = '4px';
    dom.style.color = '#F9F9F9';
    dom.style.fontSize = '12px';
    dom.style.opacity = '0';
    dom.style.padding = '4px 8px';
    dom.style.transformOrigin = 'bottom';
    dom.style.visibility = 'hidden';
    dom.style.zIndex = '9999';

    const content = document.createElement('div');
    dom.appendChild(content);

    return { dom, content };
  }, []);

  const [getSortMetadata] = useBarSortHelper({ config: config! });

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
            const ids: string[] = config?.group
              ? config.group.id === config?.facets?.id
                ? [
                    ...(aggregatedData?.categories[params.name]?.groups[selectedFacetValue!]?.unselected.ids ?? []),
                    ...(aggregatedData?.categories[params.name]?.groups[selectedFacetValue!]?.selected.ids ?? []),
                  ]
                : [
                    ...(aggregatedData?.categories[params.name]?.groups[params.seriesName!]?.unselected.ids ?? []),
                    ...(aggregatedData?.categories[params.name]?.groups[params.seriesName!]?.selected.ids ?? []),
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

  React.useEffect(() => {
    if (instance && instance.getDom() && !instance?.getDom()?.querySelector('#axis-tooltip')) {
      instance.getDom().appendChild(axisLabelTooltip.dom);
    }
  }, [axisLabelTooltip.dom, instance]);

  return options ? (
    <Box
      component="div"
      pos="relative"
      ref={setRef}
      style={{ width: `${Math.max(containerWidth, chartMinWidth)}px`, height: `${chartHeight + CHART_HEIGHT_MARGIN}px` }}
    />
  ) : null;
}

export const SingleEChartsBarChart = React.memo(EagerSingleEChartsBarChart);
