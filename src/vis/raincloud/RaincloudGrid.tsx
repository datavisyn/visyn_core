import { SimpleGrid } from '@mantine/core';
import React from 'react';
import { VisColumn } from '../interfaces';
import { IRaincloudConfig } from './interfaces';
import { getRaincloudData } from './utils';

import { useAsync } from '../../hooks/useAsync';
import { InvalidCols } from '../general/InvalidCols';
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
      {data && config.numColumnsSelected.length >= 1 ? (
        data.numColVals.map((numCol) => {
          return <Raincloud key={numCol.info.id} column={numCol} config={config} selectionCallback={selectionCallback} selected={selected} />;
        })
      ) : (
        <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a raincloud chart, select at least 2 numerical columns." />
      )}
    </SimpleGrid>
  );
}
