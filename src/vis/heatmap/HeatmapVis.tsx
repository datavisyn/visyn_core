import { Group } from '@mantine/core';
import * as React from 'react';
import { ICommonVisProps } from '../interfaces';
import { HeatmapGrid } from './HeatmapGrid';
import { IHeatmapConfig } from './interfaces';

export function HeatmapVis({
  config,
  columns,
  setConfig,
  selectionCallback = () => null,
  selectedMap = {},
  enableSidebar,
  setShowSidebar,
  showSidebar,
}: ICommonVisProps<IHeatmapConfig>) {
  return (
    <Group sx={{ height: '100%', width: '100%' }} noWrap>
      <HeatmapGrid config={config} columns={columns} selected={selectedMap} selectionCallback={selectionCallback} setExternalConfig={setConfig} />
    </Group>
  );
}
