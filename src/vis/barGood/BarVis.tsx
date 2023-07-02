import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group } from '@mantine/core';

import { IBarConfig, ICommonVisProps } from '../interfaces';
import { BarChart } from './BarChart';

export function BarVis({ externalConfig, columns, selectionCallback = () => null, selectedMap = {}, selectedList = [] }: ICommonVisProps<IBarConfig>) {
  return (
    <Group noWrap p={0} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }}>
      <BarChart config={externalConfig} columns={columns} selectedMap={selectedMap} selectionCallback={selectionCallback} selectedList={selectedList} />
    </Group>
  );
}
