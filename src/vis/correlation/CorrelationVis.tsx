import * as React from 'react';
import { ICommonVisProps } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ICorrelationConfig } from './interfaces';
import { i18n } from '../../i18n';
import { WarningMessage } from '../general/WarningMessage';

export function CorrelationVis({ config, columns, showDownloadScreenshot, uniquePlotId }: ICommonVisProps<ICorrelationConfig>) {
  return config.numColumnsSelected.length > 1 ? (
    <CorrelationMatrix config={config} columns={columns} uniquePlotId={uniquePlotId} showDownloadScreenshot={showDownloadScreenshot} />
  ) : (
    <WarningMessage centered dataTestId="visyn-vis-missing-column-warning" title={i18n.t('visyn:vis.missingColumn.errorHeader')}>
      {i18n.t('visyn:vis.missingColumn.correlationError')}
    </WarningMessage>
  );
}
