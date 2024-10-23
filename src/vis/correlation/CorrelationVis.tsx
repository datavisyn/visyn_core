import * as React from 'react';
import { InvalidCols } from '../general/InvalidCols';
import { ICommonVisProps } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ICorrelationConfig } from './interfaces';
import { i18n } from '../../i18n';

export function CorrelationVis({ config, columns, showDownloadScreenshot, uniquePlotId }: ICommonVisProps<ICorrelationConfig>) {
  return config.numColumnsSelected.length > 1 ? (
    <CorrelationMatrix config={config} columns={columns} uniquePlotId={uniquePlotId} showDownloadScreenshot={showDownloadScreenshot} />
  ) : (
    <InvalidCols headerMessage={i18n.t('visyn:vis.missingColumn.errorHeader')} bodyMessage={i18n.t('visyn:vis.missingColumn.correlationError')} />
  );
}
