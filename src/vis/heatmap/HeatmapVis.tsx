import { Group } from '@mantine/core';
import * as React from 'react';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { ICommonVisProps, IHeatmapConfig } from '../interfaces';
import { HeatmapGrid } from './HeatmapGrid';

export function HeatmapVis({
  externalConfig,
  columns,
  setExternalConfig,
  selectionCallback = () => null,
  selectedMap = {},
  enableSidebar,
  setShowSidebar,
  showSidebar,
}: ICommonVisProps<IHeatmapConfig>) {
  return (
    <Group sx={{ height: '100%', width: '100%' }} noWrap>
      <HeatmapGrid
        config={externalConfig}
        columns={columns}
        selected={selectedMap}
        selectionCallback={selectionCallback}
        setExternalConfig={setExternalConfig}
      />
    </Group>
  );
}
