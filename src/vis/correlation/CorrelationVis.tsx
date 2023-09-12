import * as React from 'react';
import { ICommonVisProps } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ICorrelationConfig } from './interfaces';

export function CorrelationVis({ config, columns }: ICommonVisProps<ICorrelationConfig>) {
  return config.numColumnsSelected.length > 1 ? <CorrelationMatrix config={config} columns={columns} /> : null;
}
