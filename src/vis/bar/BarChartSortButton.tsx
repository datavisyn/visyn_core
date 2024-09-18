import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';
import * as React from 'react';
import { dvSortAsc, dvSortDesc, dvSort } from '../../icons';
import { selectionColorDark } from '../../utils';
import { IBarConfig, EBarSortState, EBarDirection } from './interfaces';

export enum EBarSortParameters {
  AGGREGATION = 'Aggregation',
  CATEGORIES = 'Categories',
}

export function BarChartSortButton({
  config,
  setConfig,
  sort = EBarSortParameters.AGGREGATION,
}: {
  config: IBarConfig;
  setConfig: (c: IBarConfig) => void;
  sort: EBarSortParameters | null;
}) {
  const { tooltipLabel, icon, color, nextSortState } = React.useMemo(() => {
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
              color: 'dark',
              nextSortState: { ...fallbackSortState, x: EBarSortState.DESCENDING },
            };
          }
          if (config.sortState.x === EBarSortState.DESCENDING) {
            return {
              tooltipLabel: `Remove sorting from ${config.catColumnSelected?.name ?? 'selected category'}`,
              icon: dvSortDesc,
              color: 'dark',
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
  }, [config.aggregateType, config.catColumnSelected?.name, config.direction, config.sortState, sort]);

  return (
    <Tooltip label={tooltipLabel} disabled={!tooltipLabel} position="top" withArrow>
      <ActionIcon
        c={color}
        variant="subtle"
        onClick={() => {
          setConfig({ ...config, sortState: { ...nextSortState } });
        }}
        style={
          sort === EBarSortParameters.CATEGORIES
            ? config.direction === EBarDirection.HORIZONTAL
              ? {}
              : config.direction === EBarDirection.VERTICAL
                ? { transform: 'rotate(90deg)' }
                : {}
            : sort === EBarSortParameters.AGGREGATION
              ? config.direction === EBarDirection.HORIZONTAL
                ? { transform: 'rotate(90deg)' }
                : config.direction === EBarDirection.VERTICAL
                  ? {}
                  : {}
              : {}
        }
      >
        <FontAwesomeIcon icon={icon} />
      </ActionIcon>
    </Tooltip>
  );
}
