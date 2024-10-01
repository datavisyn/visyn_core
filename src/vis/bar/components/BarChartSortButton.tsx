import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EBarDirection, EBarSortParameters } from '../interfaces';
import { useBarSortHelper } from '../hooks';
import { IBarConfig } from '../interfaces';

export function BarChartSortButton({
  config,
  setConfig,
  sort = EBarSortParameters.AGGREGATION,
}: {
  config: IBarConfig;
  setConfig: (c: IBarConfig) => void;
  sort: EBarSortParameters | null;
}) {
  const { tooltipLabel, icon, color, nextSortState } = useBarSortHelper({ config, sort });

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
