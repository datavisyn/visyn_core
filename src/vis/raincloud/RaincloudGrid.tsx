import React from 'react';
import { SimpleGrid } from '@mantine/core';
import { IRaincloudConfig, VisColumn } from '../interfaces';
import { getRaincloudData } from './utils';

import { useAsync } from '../../hooks/useAsync';
import { Raincloud } from './Raincloud';

export function RaincloudGrid({
  columns,
  config,
  selectionCallback,
  selected,
}: {
  columns: VisColumn[];
  config: IRaincloudConfig;
  selectionCallback: (ids: string[]) => void;
  selected: { [key: string]: boolean };
}) {
  const { value: data } = useAsync(getRaincloudData, [columns, config.numColumnsSelected]);

  return (
    <SimpleGrid cols={Math.ceil(Math.sqrt(data?.numColVals.length))} style={{ width: '100%', height: '100%' }}>
      {data &&
        data.numColVals.map((numCol) => {
          return <Raincloud key={numCol.info.id} column={numCol} config={config} selectionCallback={selectionCallback} selected={selected} />;
        })}
    </SimpleGrid>
  );
}
