import * as React from 'react';
import { Group, Stack } from '@mantine/core';
import { ICorrelationConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { CorrelationVisSidebar } from './CorrelationVisSidebar';
import { CorrelationMatrix } from './CorrelationMatrix';

export function CorrelationVis({
  config,
  columns,
  setConfig,
  enableSidebar,
  showSidebar,
  setShowSidebar,
  extensions,
}: {
  config: ICorrelationConfig;
  columns: VisColumn[];
  setConfig?: (config: IVisConfig) => void;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
}) {
  return (
    <Group
      noWrap
      pl={0}
      pr={0}
      spacing={0}
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

      <Stack
        spacing={0}
        sx={{
          flexGrow: 1,
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {config.numColumnsSelected.length > 1 ? <CorrelationMatrix config={config} columns={columns} /> : null}
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <CorrelationVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
