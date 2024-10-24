import { Stack } from '@mantine/core';
import * as React from 'react';
import { ICommonVisProps } from '../interfaces';
import { IBarConfig } from './interfaces';
import { BarChart } from './BarChart';
import { i18n } from '../../i18n';
import { WarningMessage } from '../general/WarningMessage';

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
        <WarningMessage centered dataTestId="visyn-vis-missing-column-warning" title={i18n.t('visyn:vis.missingColumn.errorHeader')}>
          {i18n.t('visyn:vis.missingColumn.barError')}
        </WarningMessage>
      )}
    </Stack>
  );
}
