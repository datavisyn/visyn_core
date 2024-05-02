import { Stack } from '@mantine/core';
import React from 'react';

import { InvalidCols } from '../general/InvalidCols';
import { ICommonVisProps } from '../interfaces';
import { BarChart } from './BarChart';
import { IBarConfig } from './interfaces';

export function BarVis({ config, columns, selectionCallback = () => null, selectedMap = {}, selectedList = [], ...rest }: ICommonVisProps<IBarConfig>) {
  return (
    <Stack p={0} style={{ height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }}>
      {config.catColumnSelected ? (
        <BarChart config={config} columns={columns} selectedMap={selectedMap} selectionCallback={selectionCallback} selectedList={selectedList} {...rest} />
      ) : (
        <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a bar chart, please select at least 1 column." />
      )}
    </Stack>
  );
}
