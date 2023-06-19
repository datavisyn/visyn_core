import * as React from 'react';

import * as d3v7 from 'd3v7';
import { Group, Stack } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { Text } from '@mantine/core';
import { IVisConfig, VisColumn, IParallelCoordinatesConfig } from '../interfaces';
import { useAsync } from '../../hooks';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { ParallelVisSidebar } from './ParallelVisSidebar';
import { ParallelPlot } from './ParallelPlot';
import { getParallelData } from './utils';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function ParallelVis({
  config,
  optionsConfig,
  extensions,
  columns,
  setConfig,
  enableSidebar,
  setShowSidebar,
  showSidebar,
}: {
  config: IParallelCoordinatesConfig;
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
        {config?.numColumnsSelected?.length > 1 ? <ParallelPlot config={config} columns={columns} /> : null}
        <Text>test</Text>
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <ParallelVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
