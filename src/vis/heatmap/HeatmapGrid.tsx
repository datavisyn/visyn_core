import { /* Box, */ Loader, Stack } from '@mantine/core';
import React, { useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { InvalidCols } from '../general/InvalidCols';
import { VisColumn } from '../interfaces';
import { Heatmap } from './Heatmap';
import { IHeatmapConfig } from './interfaces';
import { getHeatmapData /* , setsOfTwo */ } from './utils';

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
  const hasTwoCatCols = useMemo(() => allColumns?.catColumn && allColumns?.catColumn?.length === 2, [allColumns?.catColumn]);

  // NOTE: @dv-usama-ansari: This flag is used when multiple heatmaps are rendered.
  // const hasAtLeastTwoCatCols = useMemo(() => allColumns?.catColumn && allColumns?.catColumn?.length > 1, [allColumns?.catColumn]);

  const margin = useMemo(() => {
    return {
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    };
  }, []);

  // NOTE: @dv-usama-ansari: This implementation for multiple heatmaps works, but it's not very performant.
  // const heatmapMultiples = useMemo(() => {
  //   return setsOfTwo(hasTwoCatCols ? allColumns?.catColumn : []) as Awaited<ReturnType<typeof getHeatmapData>>['catColumn'][];
  // }, [allColumns?.catColumn, hasTwoCatCols]);

  return (
    <Stack align="center" justify="center" sx={{ width: '100%', height: '100%' }} p="sm">
      {status === 'pending' ? (
        <Loader />
      ) : !hasTwoCatCols ? (
        <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a heatmap chart, select exactly 2 categorical columns." />
      ) : (
        <Heatmap
          column1={allColumns.catColumn[0]}
          column2={allColumns.catColumn[1]}
          aggregateColumn={allColumns.aggregateColumn}
          margin={margin}
          config={config}
          selected={selected}
          setExternalConfig={setExternalConfig}
          selectionCallback={selectionCallback}
        />

        // NOTE: @dv-usama-ansari: This implementation for multiple heatmaps works, but it's not very performant.
        // <Box
        //   style={{
        //     display: 'grid',
        //     gridTemplateColumns: `repeat(${heatmapMultiples.length === 1 ? 1 : heatmapMultiples.length - 1}, 1fr)`,
        //     gridTemplateRows: `repeat(${heatmapMultiples.length === 1 ? 1 : heatmapMultiples.length - 1}, 1fr)`,
        //     width: '100%',
        //     height: '100%',
        //   }}
        // >
        //   {heatmapMultiples.map(([column1, column2]) => (
        //     <Heatmap
        //       key={`${column1.info.id}-${column2.info.id}`}
        //       column1={column1}
        //       column2={column2}
        //       aggregateColumn={allColumns.aggregateColumn}
        //       margin={margin}
        //       config={config}
        //       selected={selected}
        //       setExternalConfig={setExternalConfig}
        //       selectionCallback={selectionCallback}
        //     />
        //   ))}
        // </Box>
      )}
    </Stack>
  );
}
