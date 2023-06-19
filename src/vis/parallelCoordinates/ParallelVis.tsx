import * as React from 'react';
import merge from 'lodash/merge';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useState } from 'react';
import { Center, Group, Stack } from '@mantine/core';
import * as d3 from 'd3v7';
import { EFilterOptions, IVisConfig, Scales, IScatterConfig, VisColumn, EScatterSelectSettings, IParallelCoordinatesConfig } from '../interfaces';
import { InvalidCols } from '../general/InvalidCols';
import { beautifyLayout } from '../general/layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { useAsync } from '../../hooks';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { i18n } from '../../i18n';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { ParallelVisSidebar } from './ParallelVisSidebar';

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
        {config.numColumnsSelected.length > 1 ? 'hello world' : null}
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <ParallelVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
