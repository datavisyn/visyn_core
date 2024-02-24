import { Loader, Stack } from '@mantine/core';
import * as React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { InvalidCols } from '../general/InvalidCols';
import { VisColumn } from '../interfaces';
import { Heatmap } from './Heatmap';
import { IHeatmapConfig } from './interfaces';
import { getHeatmapData } from './utils';

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
  const hasAtLeast2CatCols = allColumns?.catColumn && allColumns?.catColumn?.length > 1;

  const margin = React.useMemo(() => {
    return {
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    };
  }, []);

  return (
    <Stack align="center" justify="center" style={{ width: '100%', height: '100%' }} p="sm">
      {status === 'pending' && <Loader />}
      {status === 'success' && hasAtLeast2CatCols && (
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
      )}
      {status === 'success' && !hasAtLeast2CatCols && (
        <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a heatmap chart, select at least 2 categorical columns." />
      )}
    </Stack>
  );
}
