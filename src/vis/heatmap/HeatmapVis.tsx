import { Group, Text } from '@mantine/core';
import * as React from 'react';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { IHeatmapConfig, IVisConfig, VisColumn } from '../interfaces';
import { HeatmapVisSidebar } from './HeatmapVisSidebar';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { Heatmap } from './Heatmap';

export function HeatmapVis({
  config,
  columns,
  setConfig,
  selectionCallback = () => null,
  selected = {},
  enableSidebar,
  setShowSidebar,
  showSidebar,
  showDragModeOptions = true,
}: {
  config: IHeatmapConfig;
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  showDragModeOptions?: boolean;
  enableSidebar?: boolean;
}) {
  return (
    <Group sx={{ height: '100%', width: '100%' }} noWrap>
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}
      <Heatmap config={config} columns={columns} />
      {showSidebar ? (
        <VisSidebarWrapper>
          <HeatmapVisSidebar config={config} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
