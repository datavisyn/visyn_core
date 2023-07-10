import * as React from 'react';
import { Stack } from '@mantine/core';
import { ICommonVisProps, ICorrelationConfig } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';

export function CorrelationVis({ externalConfig, columns }: ICommonVisProps<ICorrelationConfig>) {
  return externalConfig.numColumnsSelected.length > 1 ? <CorrelationMatrix config={externalConfig} columns={columns} /> : null;
}
