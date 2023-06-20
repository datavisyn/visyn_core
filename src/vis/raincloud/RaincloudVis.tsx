import * as React from 'react';
import merge from 'lodash/merge';
import { useMemo, useRef } from 'react';
import { Group, SimpleGrid, Stack, Text } from '@mantine/core';

import { VisColumn, IVisConfig, IHexbinConfig, EScatterSelectSettings, EFilterOptions, IRaincloudConfig } from '../interfaces';
import { InvalidCols } from '../general';
import { i18n } from '../../i18n';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { VisFilterAndSelectSettings } from '../VisFilterAndSelectSettings';
import { RaincloudVisSidebar } from './RaincloudVisSidebar';
import { Raincloud } from './Raincloud';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function RaincloudVis({
  config,
  extensions,
  columns,
  setConfig,
  selectionCallback = () => null,
  selected = {},
  enableSidebar,
  setShowSidebar,
  showSidebar,
  showDragModeOptions = true,
  filterCallback = () => null,
}: {
  config: IRaincloudConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  showDragModeOptions?: boolean;
  enableSidebar?: boolean;
  filterCallback?: (s: EFilterOptions) => void;
}) {
  const ref = useRef();

  return (
    <Group noWrap pl={0} pr={0} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
        <Raincloud columns={columns} config={config} />
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <RaincloudVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
