import * as React from 'react';

import { Stack } from '@mantine/core';
import { ICommonVisProps, IParallelCoordinatesConfig } from '../interfaces';
import { ParallelPlot } from './ParallelPlot';

export function ParallelVis({ config, selectionCallback, columns, selectedMap, selectedList }: ICommonVisProps<IParallelCoordinatesConfig>) {
  return (
    <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
      {config?.numColumnsSelected?.length > 1 ? (
        <ParallelPlot selectionCallback={selectionCallback} config={config} columns={columns} selectedMap={selectedMap} hasSelected={selectedList.length > 0} />
      ) : null}
    </Stack>
  );
}
