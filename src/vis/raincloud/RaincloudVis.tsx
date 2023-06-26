import * as React from 'react';
import { useRef } from 'react';
import { Group, Stack } from '@mantine/core';

import { VisColumn, IVisConfig, IRaincloudConfig, ICommonVisProps } from '../interfaces';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { RaincloudVisSidebar } from './RaincloudVisSidebar';
import { RaincloudGrid } from './RaincloudGrid';

export function RaincloudVis({
  externalConfig,
  columns,
  setExternalConfig,
  selectionCallback = () => null,
  enableSidebar,
  selectedMap = {},
  setShowSidebar,
  showSidebar,
}: ICommonVisProps<IRaincloudConfig>) {
  const ref = useRef();

  return (
    <Group noWrap pl={0} pr={0} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
        <RaincloudGrid columns={columns} config={externalConfig} selectionCallback={selectionCallback} selected={selectedMap} />
      </Stack>
    </Group>
  );
}
