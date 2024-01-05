import { Box } from '@mantine/core';
import { MRT_Column, MRT_Header, MRT_TableInstance } from 'mantine-react-table';
import * as React from 'react';

export function HistogramFilter({
  column,
  header,
  rangeFilterIndex,
  table,
}: {
  column: MRT_Column<any>;
  header: MRT_Header<any>;
  rangeFilterIndex?: number;
  table: MRT_TableInstance<any>;
}) {
  return <Box style={{ flexGrow: 1 }}>test</Box>;
}
