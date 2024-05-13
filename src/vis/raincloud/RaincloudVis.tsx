import { Center, Stack } from '@mantine/core';
import * as React from 'react';
import { uniqueId } from 'lodash';
import { ICommonVisProps } from '../interfaces';
import { RaincloudGrid } from './RaincloudGrid';
import { IRaincloudConfig } from './interfaces';
import { DownloadPlotButton } from '../general/DownloadPlotButton';

export function RaincloudVis({
  config,
  columns,
  selectionCallback = () => null,
  selectedMap = {},
  uniquePlotId,
  showDownloadScreenshot,
}: ICommonVisProps<IRaincloudConfig>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('RaincloudVis'), [uniquePlotId]);

  return (
    <Stack pl={0} pr={0} style={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }}>
      {showDownloadScreenshot ? (
        <Center>
          <DownloadPlotButton uniquePlotId={id} config={config} />
        </Center>
      ) : null}
      <Stack gap={0} style={{ height: '100%', width: '100%' }} id={id}>
        <RaincloudGrid columns={columns} config={config} selectionCallback={selectionCallback} selected={selectedMap} />
      </Stack>
    </Stack>
  );
}
