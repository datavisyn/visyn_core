import * as React from 'react';

import { useBarSortHelper } from './BarSortHook';
import { CallbackArray, CallbackObject } from '../../../echarts';
import { sanitize } from '../../../utils';
import { ICommonVisProps } from '../../interfaces';
import { EBarDirection, EBarSortParameters, IBarConfig } from '../interfaces';
import { AggregatedDataType, SERIES_ZERO } from '../interfaces/internal';

function useGetClickEvents({
  aggregatedData,
  config,
  selectedFacetIndex,
  selectedFacetValue,
  selectedList,
  selectionCallback,
  setConfig,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedList'> & {
  aggregatedData: AggregatedDataType;
  selectedFacetIndex?: number;
  selectedFacetValue?: string;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
}) {
  const [getSortMetadata] = useBarSortHelper({ config: config! });
  const clickToFocusFacet = React.useMemo(
    () =>
      ({
        query: { titleIndex: 0 },
        handler: () => {
          setConfig?.({ ...config!, focusFacetIndex: config?.focusFacetIndex === selectedFacetIndex ? null : selectedFacetIndex });
        },
      }) as CallbackObject,
    [config, selectedFacetIndex, setConfig],
  );

  const clickBarToToggleSelect = React.useMemo(
    () =>
      ({
        query: { seriesType: 'bar' },
        handler: (params) => {
          if (params.componentType === 'series') {
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
          }
        },
      }) as CallbackObject,
    [aggregatedData?.categories, config?.facets?.id, config?.group, selectedFacetValue, selectedList, selectionCallback],
  );

  const clickAxisLabelToToggleSelect = React.useMemo(
    () =>
      ({
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
      }) as CallbackObject,
    [aggregatedData?.categories, config?.direction, selectedList, selectionCallback],
  );

  const clickAxisTitleToSortAlongHorizontalAxis = React.useMemo(
    () =>
      ({
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
      }) as CallbackObject,
    [config, getSortMetadata, setConfig],
  );

  const clickAxisTitleToSortAlongVerticalAxis = React.useMemo(
    () =>
      ({
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
      }) as CallbackObject,
    [config, getSortMetadata, setConfig],
  );

  return [
    clickToFocusFacet,
    clickBarToToggleSelect,
    clickAxisLabelToToggleSelect,
    clickAxisTitleToSortAlongHorizontalAxis,
    clickAxisTitleToSortAlongVerticalAxis,
  ];
}

/**
 * This is a placeholder function and will not be implemented.
 * This function is written only for the sake of completeness.
 *
 * The underlying functionality will be addressed in
 *
 * @returns mouseoverEvents and mouseoutEvents
 */
function useGetHoverEvents() {
  return { mouseoverEvents: [], mouseoutEvents: [] };
}

export function useGetBarChartMouseEvents({
  aggregatedData,
  config,
  selectedFacetIndex,
  selectedFacetValue,
  selectedList,
  selectionCallback,
  setConfig,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig' | 'selectedList'> & {
  aggregatedData: AggregatedDataType;
  selectedFacetIndex?: number;
  selectedFacetValue?: string;
  selectionCallback: (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => void;
}): { click: CallbackArray; mouseover: CallbackArray; mouseout: CallbackArray } {
  const clickEvents = useGetClickEvents({
    aggregatedData,
    config,
    selectedFacetIndex,
    selectedFacetValue,
    selectedList,
    selectionCallback,
    setConfig,
  });
  const { mouseoverEvents, mouseoutEvents } = useGetHoverEvents();

  return { click: clickEvents, mouseover: mouseoverEvents, mouseout: mouseoutEvents };
}
