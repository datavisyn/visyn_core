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
    <Group style={{ height: '100%', width: '100%' }} wrap="nowrap">
      <HeatmapGrid config={config} columns={columns} selected={selectedMap} selectionCallback={selectionCallback} setExternalConfig={setConfig} />
    </Group>
  );
}
