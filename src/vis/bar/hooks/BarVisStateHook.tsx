import * as React from 'react';

import { useSetState } from '@mantine/hooks';
import { type ScaleOrdinal } from 'd3v7';
import { BarSeriesOption } from 'echarts/charts';
import { DEFAULT_COLOR } from 'lineupjs';

import { ECOption } from '../../../echarts';
import { useAsync } from '../../../hooks';
import { selectionColorDark } from '../../../utils';
import { NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../../general';
import { ColumnInfo, EAggregateTypes } from '../../interfaces';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState, IBarConfig, SortDirectionMap } from '../interfaces';
import { AggregatedDataType, GenerateAggregatedDataLookup, WorkerWrapper, sortSeries } from '../interfaces/internal';
import { numberFormatter } from '../utils';

export function useGetBarVisState({
  aggregatedData,
  config,
  containerWidth,
  globalMax,
  globalMin,
  gridLeft,
  groupColorScale,
  hasSelected,
  isGroupedByNumerical,
  labelsMap,
  seriesBase,
}: {
  aggregatedData: AggregatedDataType;
  config: IBarConfig;
  containerWidth: number;
  globalMax?: number;
  globalMin?: number;
  gridLeft: number;
  groupColorScale: ScaleOrdinal<string, string, never>;
  hasSelected: boolean;
  isGroupedByNumerical: boolean;
  labelsMap: Record<string, string>;
  seriesBase: BarSeriesOption;
}) {
  const generateBarSeriesWorker = React.useCallback(
    async (...args: Parameters<GenerateAggregatedDataLookup['generateBarSeries']>) => WorkerWrapper.generateBarSeries(...args),
    [],
  );
  const { execute: generateBarSeriesTrigger, status: generateBarSeriesStatus } = useAsync(generateBarSeriesWorker);

  const [visState, setVisState] = useSetState({
    series: [] as BarSeriesOption[],
    xAxis: null as ECOption['xAxis'] | null,
    yAxis: null as ECOption['yAxis'] | null,
  });

  const [yAxisLabel, setYAxisLabel] = React.useState<string>('');
  const [aggregationAxisName, setAggregationAxisName] = React.useState<string>('');
  const [aggregationAxisSortText, setAggregationAxisSortText] = React.useState<string>('');
  const [categoricalAxisName, setCategoricalAxisName] = React.useState<string>('');
  const [categoricalAxisSortText, setCategoricalAxisSortText] = React.useState<string>('');

  const [workerResult, setWorkerResult] = React.useState<Awaited<ReturnType<typeof generateBarSeriesWorker>>>([]);

  const isLoading = React.useMemo(() => generateBarSeriesStatus === 'pending', [generateBarSeriesStatus]);
  const isError = React.useMemo(() => generateBarSeriesStatus === 'error', [generateBarSeriesStatus]);
  const isSuccess = React.useMemo(
    () => generateBarSeriesStatus === 'success' && (visState?.series.length ?? 0) > 0,
    [generateBarSeriesStatus, visState?.series.length],
  );

  const barSeries = React.useMemo(() => {
    return workerResult.map((series) => {
      if (!series) {
        return seriesBase;
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
  }, [config?.group, groupColorScale, hasSelected, seriesBase, workerResult]);

  React.useEffect(() => {
    const fetchWorkerResult = async () => {
      const result = await generateBarSeriesTrigger(aggregatedData, {
        aggregateType: config?.aggregateType as EAggregateTypes,
        display: config?.display as EBarDisplayType,
        facets: config?.facets as ColumnInfo,
        group: config?.group as ColumnInfo,
        groupType: config?.groupType as EBarGroupingType,
      });
      setWorkerResult(result);
    };

    fetchWorkerResult();
  }, [aggregatedData, config?.aggregateType, config?.display, config?.facets, config?.group, config?.groupType, generateBarSeriesTrigger]);

  React.useEffect(() => {
    if (barSeries.length > 0 || !aggregatedData || generateBarSeriesStatus !== 'success') {
      if (config?.direction === EBarDirection.HORIZONTAL) {
        const sortedSeries = sortSeries(
          barSeries.map((item) => (item ? { categories: (item as BarSeriesOption & { categories: string[] }).categories, data: item.data } : null)),
          { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.HORIZONTAL },
        );
        setVisState((v) => ({
          // NOTE: @dv-usama-ansari: Reverse the data for horizontal bars to show the largest value on top for descending order and vice versa.
          series: barSeries.map((item, itemIndex) => ({
            ...item,
            data: sortedSeries[itemIndex]?.data ? [...(sortedSeries[itemIndex]?.data as NonNullable<BarSeriesOption['data']>)].reverse() : [],
          })),

          yAxis: {
            ...v.yAxis,
            type: 'category' as const,
            data: sortedSeries[0]?.categories ? [...(sortedSeries[0]?.categories as string[])].reverse() : [],
          },
        }));
      }
      if (config?.direction === EBarDirection.VERTICAL) {
        const sortedSeries = sortSeries(
          barSeries.map((item) => (item ? { categories: (item as BarSeriesOption & { categories: string[] }).categories, data: item.data } : null)),
          { sortState: config?.sortState as { x: EBarSortState; y: EBarSortState }, direction: EBarDirection.VERTICAL },
        );
        setVisState((v) => ({
          series: barSeries.map((item, itemIndex) => ({ ...item, data: sortedSeries[itemIndex]?.data ?? [] })),
          xAxis: { ...v.xAxis, type: 'category' as const, data: sortedSeries[0]?.categories ?? [] },
        }));
      }
    }
  }, [aggregatedData, barSeries, config?.direction, config?.sortState, generateBarSeriesStatus, setVisState]);

  React.useEffect(() => {
    if (visState.series.length === 0 || !aggregatedData || generateBarSeriesStatus !== 'success') {
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
    const aggregationSortText =
      config?.direction === EBarDirection.HORIZONTAL
        ? SortDirectionMap[config?.sortState?.x ?? EBarSortState.NONE]
        : config?.direction === EBarDirection.VERTICAL
          ? SortDirectionMap[config?.sortState?.y ?? EBarSortState.NONE]
          : '';

    const categoricalAxisNameBase = config?.catColumnSelected?.name;
    const categoricalAxisDescription = config?.showColumnDescriptionText
      ? config?.catColumnSelected?.description
        ? `: ${config?.catColumnSelected?.description}`
        : ''
      : '';
    const categoricalSortText =
      config?.direction === EBarDirection.HORIZONTAL
        ? SortDirectionMap[config?.sortState?.y ?? EBarSortState.NONE]
        : config?.direction === EBarDirection.VERTICAL
          ? SortDirectionMap[config?.sortState?.x ?? EBarSortState.NONE]
          : '';

    setAggregationAxisName(`${aggregationAxisNameBase}${aggregationAxisDescription} (${aggregationSortText})`);
    setAggregationAxisSortText(aggregationSortText);
    setCategoricalAxisName(`${categoricalAxisNameBase}${categoricalAxisDescription} (${categoricalSortText})`);
    setCategoricalAxisSortText(categoricalSortText);
    setYAxisLabel(config?.direction === EBarDirection.HORIZONTAL ? categoricalAxisName : aggregationAxisName);
  }, [
    aggregatedData,
    aggregationAxisName,
    categoricalAxisName,
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
    generateBarSeriesStatus,
    visState.series.length,
  ]);

  const xAxis = React.useMemo(() => {
    if (!aggregatedData || !aggregationAxisName || !categoricalAxisName || visState.series.length === 0) {
      return null;
    }
    if (config?.direction === EBarDirection.HORIZONTAL) {
      return {
        type: 'value' as const,
        name: aggregationAxisName,
        nameLocation: 'middle' as const,
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
      };
    }
    if (config?.direction === EBarDirection.VERTICAL) {
      return {
        type: 'category' as const,
        name: categoricalAxisName,
        nameLocation: 'middle' as const,
        nameGap: 60,
        data: (visState.xAxis as { data: number[] })?.data ?? [],
        axisLabel: {
          show: true,
          formatter: (value: string) => labelsMap[value],
          rotate: 45,
        },
        nameTextStyle: {
          color: categoricalAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
        },
        triggerEvent: true,
      };
    }
    return null;
  }, [
    aggregatedData,
    aggregationAxisName,
    categoricalAxisName,
    visState.series.length,
    visState.xAxis,
    config?.direction,
    globalMin,
    globalMax,
    aggregationAxisSortText,
    categoricalAxisSortText,
    labelsMap,
  ]);

  const yAxis = React.useMemo(() => {
    if (!aggregatedData || !aggregationAxisName || !categoricalAxisName || visState.series.length === 0) {
      return null;
    }
    if (config?.direction === EBarDirection.HORIZONTAL) {
      return {
        type: 'category' as const,
        name: categoricalAxisName,
        nameLocation: 'middle' as const,
        nameGap: Math.min(gridLeft, containerWidth / 3) - 20,
        data: (visState.yAxis as { data: number[] })?.data ?? [],
        axisLabel: {
          show: true,
          width: gridLeft - 20,
          formatter: (value: string) => labelsMap[value],
        },
        nameTextStyle: {
          color: categoricalAxisSortText !== SortDirectionMap[EBarSortState.NONE] ? selectionColorDark : VIS_NEUTRAL_COLOR,
        },
        triggerEvent: true,
      };
    }
    if (config?.direction === EBarDirection.VERTICAL) {
      return {
        type: 'value' as const,
        name: aggregationAxisName,
        nameLocation: 'middle' as const,
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
      };
    }
    return null;
  }, [
    aggregatedData,
    aggregationAxisName,
    categoricalAxisName,
    visState.series.length,
    visState.yAxis,
    config?.direction,
    gridLeft,
    containerWidth,
    categoricalAxisSortText,
    labelsMap,
    globalMin,
    globalMax,
    aggregationAxisSortText,
  ]);

  const groupedSeries = React.useMemo(() => {
    const filteredVisStateSeries = (visState.series ?? []).filter((series) => series.data?.some((d) => d !== null && d !== undefined));
    const [knownSeries, unknownSeries] = filteredVisStateSeries.reduce<[BarSeriesOption[], BarSeriesOption[]]>(
      (acc, series) => {
        if ((series as typeof series & { group: string }).group === NAN_REPLACEMENT) {
          acc[1].push(series);
        } else {
          acc[0].push(series);
        }
        return acc;
      },
      [[], []],
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

  return { isError, isLoading, isSuccess, visState: { ...visState, series: groupedSeries, xAxis, yAxis } as typeof visState, yAxisLabel, setYAxisLabel };
}
