import { Box, Loader, Stack } from '@mantine/core';
import React, { useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { InvalidCols } from '../general/InvalidCols';
import { VisColumn } from '../interfaces';
import { Heatmap } from './Heatmap';
import { IHeatmapConfig } from './interfaces';
import { getHeatmapData, setsOfTwo } from './utils';

export function HeatmapGrid({
  config,
  columns,
  selected,
  setExternalConfig,
  selectionCallback,
}: {
  config: IHeatmapConfig;
  columns: VisColumn[];
  selectionCallback?: (ids: string[]) => void;
  setExternalConfig?: (config: IHeatmapConfig) => void;
  selected?: { [key: string]: boolean };
}) {
  const { value: allColumns, status } = useAsync(getHeatmapData, [columns, config.catColumnsSelected, config.aggregateColumn]);
  const hasAtLeast2CatCols = useMemo(() => allColumns?.catColumn && allColumns?.catColumn?.length > 1, [allColumns?.catColumn]);

  const margin = useMemo(() => {
    return {
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    };
  }, []);

  const heatmapMultiples = useMemo(() => {
    return setsOfTwo(hasAtLeast2CatCols ? allColumns?.catColumn : []) as Awaited<ReturnType<typeof getHeatmapData>>['catColumn'][];
  }, [allColumns?.catColumn, hasAtLeast2CatCols]);

  return (
    <Stack align="center" justify="center" sx={{ width: '100%', height: '100%' }} p="sm">
      {status === 'pending' ? (
        <Loader />
      ) : !hasAtLeast2CatCols ? (
        <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a heatmap chart, select at least 2 categorical columns." />
      ) : (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${heatmapMultiples.length === 1 ? 1 : heatmapMultiples.length - 1}, 1fr)`,
            gridTemplateRows: `repeat(${heatmapMultiples.length === 1 ? 1 : heatmapMultiples.length - 1}, 1fr)`,
            width: '100%',
            height: '100%',
          }}
        >
          {heatmapMultiples.map(([column1, column2]) => (
            <Heatmap
              key={`${column1.info.id}-${column2.info.id}`}
              column1={column1}
              column2={column2}
              aggregateColumn={allColumns.aggregateColumn}
              margin={margin}
              config={config}
              selected={selected}
              setExternalConfig={setExternalConfig}
              selectionCallback={selectionCallback}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
}
