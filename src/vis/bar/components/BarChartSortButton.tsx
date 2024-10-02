import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';
import * as React from 'react';
import { useBarSortHelper } from '../hooks';
import { EBarDirection, EBarSortParameters, IBarConfig } from '../interfaces';

/**
 * @deprecated In favor of sort by clicking the axis labels
 */
export function BarChartSortButton({
  config,
  setConfig,
  sort = EBarSortParameters.AGGREGATION,
}: {
  config: IBarConfig;
  setConfig: (c: IBarConfig) => void;
  sort: EBarSortParameters;
}) {
  const [getSortMetadata] = useBarSortHelper({ config });
  // NOTE: @dv-usama-ansari: Unhooked computation!
  const { tooltipLabel, icon, color, nextSortState } = getSortMetadata(sort);

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
