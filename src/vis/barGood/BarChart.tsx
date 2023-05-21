import React from 'react';
import { Box, SimpleGrid } from '@mantine/core';
import { IBarConfig, VisColumn } from '../interfaces';
import { SingleBarChart } from './SingleBarChart';

export function BarChart({ config, columns }: { config: IBarConfig; columns: VisColumn[] }) {
  return (
    <Box style={{ width: '100%', height: '100%' }}>
      <SimpleGrid style={{ height: '100%' }} cols={config.numColumnsSelected.length > 2 ? config.numColumnsSelected.length : 1}>
        <SingleBarChart config={config} columns={columns} />
      </SimpleGrid>
    </Box>
  );
}
