import React from 'react';

import { dvSort, dvSortAsc, dvSortDesc } from '../../../icons';
import { selectionColorDark } from '../../../utils';
import { EBarDirection, EBarSortParameters, EBarSortState, IBarConfig } from '../interfaces';

export function useBarSortHelper({ config }: { config: IBarConfig }) {
  const getSortMetadata = React.useCallback(
    (sort: EBarSortParameters) => {
      const fallbackSortState = { x: EBarSortState.NONE, y: EBarSortState.NONE };
      // NOTE: @dv-usama-ansari: Code optimized for readability.
      if (config.sortState) {
        if (sort === EBarSortParameters.CATEGORIES) {
          if (config.direction === EBarDirection.HORIZONTAL) {
            if (config.sortState.y === EBarSortState.ASCENDING) {
              return {
                tooltipLabel: `Sort ${config.catColumnSelected?.name ?? 'selected category'} in descending order`,
                icon: dvSortAsc,
                color: selectionColorDark,
                nextSortState: { ...fallbackSortState, y: EBarSortState.DESCENDING },
              };
            }
            if (config.sortState.y === EBarSortState.DESCENDING) {
              return {
                tooltipLabel: `Remove sorting from ${config.catColumnSelected?.name ?? 'selected category'}`,
                icon: dvSortDesc,
                color: selectionColorDark,
                nextSortState: fallbackSortState,
              };
            }
            if (config.sortState.y === EBarSortState.NONE) {
              return {
                tooltipLabel: `Sort ${config.catColumnSelected?.name ?? 'selected category'} in ascending order`,
                icon: dvSort,
                color: 'dark',
                nextSortState: { ...fallbackSortState, y: EBarSortState.ASCENDING },
              };
            }
          }
          if (config.direction === EBarDirection.VERTICAL) {
            if (config.sortState.x === EBarSortState.ASCENDING) {
              return {
                tooltipLabel: `Sort ${config.catColumnSelected?.name ?? 'selected category'} in descending order`,
                icon: dvSortAsc,
                color: selectionColorDark,
                nextSortState: { ...fallbackSortState, x: EBarSortState.DESCENDING },
              };
            }
            if (config.sortState.x === EBarSortState.DESCENDING) {
              return {
                tooltipLabel: `Remove sorting from ${config.catColumnSelected?.name ?? 'selected category'}`,
                icon: dvSortDesc,
                color: selectionColorDark,
                nextSortState: fallbackSortState,
              };
            }
            if (config.sortState.x === EBarSortState.NONE) {
              return {
                tooltipLabel: `Sort ${config.catColumnSelected?.name ?? 'selected category'} in ascending order`,
                icon: dvSort,
                color: 'dark',
                nextSortState: { ...fallbackSortState, x: EBarSortState.ASCENDING },
              };
            }
          }
        }
        if (sort === EBarSortParameters.AGGREGATION) {
          if (config.direction === EBarDirection.HORIZONTAL) {
            if (config.sortState.x === EBarSortState.ASCENDING) {
              return {
                tooltipLabel: `Sort ${config.aggregateType} in descending order`,
                icon: dvSortAsc,
                color: selectionColorDark,
                nextSortState: { ...fallbackSortState, x: EBarSortState.DESCENDING },
              };
            }
            if (config.sortState.x === EBarSortState.DESCENDING) {
              return {
                tooltipLabel: `Remove sorting from ${config.aggregateType}`,
                icon: dvSortDesc,
                color: selectionColorDark,
                nextSortState: fallbackSortState,
              };
            }
            if (config.sortState.x === EBarSortState.NONE) {
              return {
                tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
                icon: dvSort,
                color: 'dark',
                nextSortState: { ...fallbackSortState, x: EBarSortState.ASCENDING },
              };
            }
          }
          if (config.direction === EBarDirection.VERTICAL) {
            if (config.sortState.y === EBarSortState.ASCENDING) {
              return {
                tooltipLabel: `Sort ${config.aggregateType} in descending order`,
                icon: dvSortAsc,
                color: selectionColorDark,
                nextSortState: { ...fallbackSortState, y: EBarSortState.DESCENDING },
              };
            }
            if (config.sortState.y === EBarSortState.DESCENDING) {
              return {
                tooltipLabel: `Remove sorting from ${config.aggregateType}`,
                icon: dvSortDesc,
                color: selectionColorDark,
                nextSortState: fallbackSortState,
              };
            }
            if (config.sortState.y === EBarSortState.NONE) {
              return {
                tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
                icon: dvSort,
                color: 'dark',
                nextSortState: { ...fallbackSortState, y: EBarSortState.ASCENDING },
              };
            }
          }
        }
      }
      return {
        tooltipLabel: `Sort ${sort === EBarSortParameters.CATEGORIES ? config.catColumnSelected?.name : sort === EBarSortParameters.AGGREGATION ? config.aggregateType : 'column'} in ascending order`,
        icon: dvSort,
        color: 'dark',
        nextSortState:
          config.direction === EBarDirection.HORIZONTAL
            ? { ...fallbackSortState, x: EBarSortState.ASCENDING }
            : config.direction === EBarDirection.VERTICAL
              ? { ...fallbackSortState, y: EBarSortState.ASCENDING }
              : { ...fallbackSortState },
      };
    },
    [config.aggregateType, config.catColumnSelected?.name, config.direction, config.sortState],
  );

  return [getSortMetadata] as const;
}
