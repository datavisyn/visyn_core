import * as React from 'react';
import { ICommonVisProps, ICorrelationConfig } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';

export function CorrelationVis({ config, columns }: ICommonVisProps<ICorrelationConfig>) {
  return config.numColumnsSelected.length > 1 ? <CorrelationMatrix config={config} columns={columns} /> : null;
}
