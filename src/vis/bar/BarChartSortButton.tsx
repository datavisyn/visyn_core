import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';
import React, { useMemo } from 'react';
import { dvSort, dvSortAsc, dvSortDesc } from '../../icons';
import { EBarDirection, EBarSortState, IBarConfig } from './interfaces';
import { VIS_LABEL_COLOR } from '../general';
import { selectionColorDark } from '../../utils';

export function BarChartSortButton({ config, setConfig }: { config: IBarConfig; setConfig: (c: IBarConfig) => void }) {
  const { tooltipLabel, icon, color, nextSortState } = useMemo(() => {
    const fallbackSortState = { x: EBarSortState.NONE, y: EBarSortState.NONE };
    if (config.direction === EBarDirection.HORIZONTAL) {
      switch (config.sortState.x) {
        case EBarSortState.NONE:
          return {
            tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
            icon: dvSort,
            color: VIS_LABEL_COLOR,
            nextSortState: { ...(config.sortState ?? fallbackSortState), x: EBarSortState.ASCENDING },
          };
        case EBarSortState.ASCENDING:
          return {
            tooltipLabel: `Sort ${config.aggregateType} in descending order`,
            icon: dvSortAsc,
            color: selectionColorDark,
            nextSortState: { ...(config.sortState ?? fallbackSortState), x: EBarSortState.DESCENDING },
          };
        case EBarSortState.DESCENDING:
          return { tooltipLabel: `Remove sorting from ${config.aggregateType}`, icon: dvSortDesc, color: selectionColorDark, nextSortState: fallbackSortState };
        default:
          return { tooltipLabel: '', icon: faQuestion, nextSortState: fallbackSortState };
      }
    }
    if (config.direction === EBarDirection.VERTICAL) {
      switch (config.sortState.y) {
        case EBarSortState.NONE:
          return {
            tooltipLabel: `Sort ${config.aggregateType} in ascending order`,
            icon: dvSort,
            color: VIS_LABEL_COLOR,
            nextSortState: { ...(config.sortState ?? fallbackSortState), y: EBarSortState.ASCENDING },
          };
        case EBarSortState.ASCENDING:
          return {
            tooltipLabel: `Sort ${config.aggregateType} in descending order`,
            icon: dvSortAsc,
            color: selectionColorDark,
            nextSortState: { ...(config.sortState ?? fallbackSortState), y: EBarSortState.DESCENDING },
          };
        case EBarSortState.DESCENDING:
          return { tooltipLabel: `Remove sorting from ${config.aggregateType}`, icon: dvSortDesc, color: selectionColorDark, nextSortState: fallbackSortState };
        default:
          return { tooltipLabel: '', icon: faQuestion, nextSortState: fallbackSortState };
      }
    }
    return { tooltipLabel: '' };
  }, [config.aggregateType, config.direction, config.sortState]);

  return (
    <Tooltip label={tooltipLabel} position="top" withArrow>
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
