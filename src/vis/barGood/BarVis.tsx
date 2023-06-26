import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group } from '@mantine/core';

import { IBarConfig, ICommonVisProps } from '../interfaces';
import { BarChart } from './BarChart';

import { VisSidebarOpenButton } from '../VisSidebarOpenButton';

export function BarVis({
  externalConfig,
  columns,
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  enableSidebar,
  showSidebar,
  setShowSidebar,
}: ICommonVisProps<IBarConfig>) {
  const ref = useRef();
  return (
    <Group noWrap p={0} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <BarChart config={externalConfig} columns={columns} selectedMap={selectedMap} selectionCallback={selectionCallback} selectedList={selectedList} />
    </Group>
  );
}
