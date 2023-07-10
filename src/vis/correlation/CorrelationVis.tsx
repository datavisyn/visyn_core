import * as React from 'react';
import { Stack } from '@mantine/core';
import { ICommonVisProps, ICorrelationConfig } from '../interfaces';
import { CorrelationMatrix } from './CorrelationMatrix';

export function CorrelationVis({ externalConfig, columns }: ICommonVisProps<ICorrelationConfig>) {
  return (
    <Stack
      spacing={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {externalConfig.numColumnsSelected.length > 1 ? <CorrelationMatrix config={externalConfig} columns={columns} /> : null}
    </Stack>
  );
}
