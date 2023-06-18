import * as React from 'react';
import { Group, Stack } from '@mantine/core';
import { IVisConfig, IScatterConfig, VisColumn } from '../interfaces';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { Heatmap } from './Heatmap';

export function HeatmapVis({
  config,
  optionsConfig,
  extensions,
  columns,
  setConfig,
  enableSidebar,
  setShowSidebar,
  showSidebar,
}: {
  config: IScatterConfig;
  optionsConfig?: {
    color?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    shape?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    filter?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
  };
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  enableSidebar?: boolean;
}) {
  return (
    <Group
      noWrap
      pl={0}
      pr={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        // Disable plotly crosshair cursor
        '.nsewdrag': {
          cursor: 'pointer !important',
        },
      }}
    >
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
        {config.numColumnsSelected.length > 1 ? <Heatmap config={config} columns={columns} /> : null}
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <ScatterVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
