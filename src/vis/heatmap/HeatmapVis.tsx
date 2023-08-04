import { Group } from '@mantine/core';
import * as React from 'react';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { ICommonVisProps, IHeatmapConfig } from '../interfaces';
import { HeatmapGrid } from './HeatmapGrid';

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
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}
      <HeatmapGrid config={config} columns={columns} selected={selectedMap} selectionCallback={selectionCallback} setExternalConfig={setConfig} />
    </Group>
  );
}
