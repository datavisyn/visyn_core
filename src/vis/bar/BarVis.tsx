import { Stack } from '@mantine/core';
import * as React from 'react';
import { InvalidCols } from '../general';
import { ICommonVisProps } from '../interfaces';
import { IBarConfig } from './interfaces';
import { BarChart } from './BarChart';

export function BarVis({
  config,
  setConfig,
  columns,
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  showDownloadScreenshot,
  uniquePlotId,
}: ICommonVisProps<IBarConfig>) {
  return (
    <Stack p={0} style={{ height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }}>
      {config?.catColumnSelected ? (
        <BarChart
          config={config}
          setConfig={setConfig}
          columns={columns}
          selectedMap={selectedMap}
          selectionCallback={selectionCallback}
          selectedList={selectedList}
          uniquePlotId={uniquePlotId}
          showDownloadScreenshot={showDownloadScreenshot}
        />
      ) : (
        <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a bar chart, please select at least 1 column." />
      )}
    </Stack>
  );
}
