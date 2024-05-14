import * as React from 'react';
import { InvalidCols } from '../general/InvalidCols';
import { ICommonVisProps } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ICorrelationConfig } from './interfaces';

export function CorrelationVis({ config, columns, showDownloadScreenshot, uniquePlotId }: ICommonVisProps<ICorrelationConfig>) {
  return config.numColumnsSelected.length > 1 ? (
    <CorrelationMatrix config={config} columns={columns} uniquePlotId={uniquePlotId} showDownloadScreenshot={showDownloadScreenshot} />
  ) : (
    <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a correlation chart, select at least 2 numerical columns." />
  );
}
