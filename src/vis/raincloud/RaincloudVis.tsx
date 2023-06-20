import * as React from 'react';
import { useRef } from 'react';
import { Group, Stack } from '@mantine/core';

import { VisColumn, IVisConfig, IRaincloudConfig } from '../interfaces';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { RaincloudVisSidebar } from './RaincloudVisSidebar';
import { RaincloudGrid } from './RaincloudGrid';

export function RaincloudVis({
  config,
  columns,
  setConfig,

  enableSidebar,
  setShowSidebar,
  showSidebar,
}: {
  config: IRaincloudConfig;
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;

  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  enableSidebar?: boolean;
}) {
  const ref = useRef();

  return (
    <Group noWrap pl={0} pr={0} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
        <RaincloudGrid columns={columns} config={config} />
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <RaincloudVisSidebar config={config} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
