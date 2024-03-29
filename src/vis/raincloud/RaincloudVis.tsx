import { Group, Stack } from '@mantine/core';
import * as React from 'react';
import { useRef } from 'react';

import { ICommonVisProps } from '../interfaces';
import { RaincloudGrid } from './RaincloudGrid';
import { IRaincloudConfig } from './interfaces';

export function RaincloudVis({ config, columns, selectionCallback = () => null, selectedMap = {} }: ICommonVisProps<IRaincloudConfig>) {
  const ref = useRef();

  return (
    <Group wrap="nowrap" pl={0} pr={0} style={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      <Stack gap={0} style={{ height: '100%', width: '100%' }}>
        <RaincloudGrid columns={columns} config={config} selectionCallback={selectionCallback} selected={selectedMap} />
      </Stack>
    </Group>
  );
}
