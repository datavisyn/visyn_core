import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';
import React, { useMemo } from 'react';
import { dvSortAsc, dvSortDesc, dvSort } from '../../icons';
import { selectionColorDark } from '../../utils';
import { IBarConfig, EBarSortState, EBarDirection } from './interfaces';

export function BarChartSortButton({ config, setConfig }: { config: IBarConfig; setConfig: (c: IBarConfig) => void }) {
  const { tooltipLabel, icon, color, nextSortState } = useMemo(() => {
    const fallbackSortState = { x: EBarSortState.NONE, y: EBarSortState.NONE };
    if (config.sortState) {
      if (config.direction === EBarDirection.HORIZONTAL) {
        switch (config.sortState.x) {
          case EBarSortState.ASCENDING:
            return {
              tooltipLabel: `Sort ${config.aggregateType} in descending order`,
              icon: dvSortAsc,
              color: selectionColorDark,
              nextSortState: { ...(config.sortState ?? fallbackSortState), x: EBarSortState.DESCENDING },
            };
          case EBarSortState.DESCENDING:
            return {
              tooltipLabel: `Remove sorting from ${config.aggregateType}`,
              icon: dvSortDesc,
              color: selectionColorDark,
              nextSortState: fallbackSortState,
            };
          case EBarSortState.NONE:
          default:
            return {
              tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
              icon: dvSort,
              color: 'dark',
              nextSortState: { ...(config.sortState ?? fallbackSortState), x: EBarSortState.ASCENDING },
            };
        }
      }
      if (config.direction === EBarDirection.VERTICAL) {
        switch (config.sortState.y) {
          case EBarSortState.ASCENDING:
            return {
              tooltipLabel: `Sort ${config.aggregateType} in descending order`,
              icon: dvSortAsc,
              color: selectionColorDark,
              nextSortState: { ...(config.sortState ?? fallbackSortState), y: EBarSortState.DESCENDING },
            };
          case EBarSortState.DESCENDING:
            return {
              tooltipLabel: `Remove sorting from ${config.aggregateType}`,
              icon: dvSortDesc,
              color: selectionColorDark,
              nextSortState: fallbackSortState,
            };
          case EBarSortState.NONE:
          default:
            return {
              tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
              icon: dvSort,
              color: 'dark',
              nextSortState: { ...(config.sortState ?? fallbackSortState), y: EBarSortState.ASCENDING },
            };
        }
      }
    }
    return {
      tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
      icon: dvSort,
      color: 'dark',
      nextSortState:
        config.direction === EBarDirection.HORIZONTAL
          ? { ...fallbackSortState, x: EBarSortState.ASCENDING }
          : config.direction === EBarDirection.VERTICAL
            ? { ...fallbackSortState, y: EBarSortState.ASCENDING }
            : { ...fallbackSortState },
    };
  }, [config.aggregateType, config.direction, config.sortState]);

  return (
    <Tooltip label={tooltipLabel} disabled={!tooltipLabel} position="top" withArrow>
      <ActionIcon
        c={color}
        variant="subtle"
        onClick={() => {
          setConfig({ ...config, sortState: { ...nextSortState } });
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </ActionIcon>
    </Tooltip>
  );
}
