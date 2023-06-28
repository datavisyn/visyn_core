import * as React from 'react';

import * as d3v7 from 'd3v7';
import { Group, Stack } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { Text } from '@mantine/core';
import { IVisConfig, VisColumn, IParallelCoordinatesConfig, ICommonVisProps } from '../interfaces';
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

export function ParallelVis({ externalConfig, selectionCallback, columns, selectedMap }: ICommonVisProps<IParallelCoordinatesConfig>) {
  return (
    <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
      {externalConfig?.numColumnsSelected?.length > 1 ? (
        <ParallelPlot selectionCallback={selectionCallback} config={externalConfig} columns={columns} selectedMap={selectedMap} />
      ) : null}
    </Stack>
  );
}
