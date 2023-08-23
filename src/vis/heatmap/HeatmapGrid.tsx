import { Loader, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn } from '../interfaces';
import { Heatmap } from './Heatmap';
import { IHeatmapConfig, getHeatmapData } from './utils';

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
    <Stack align="center" justify="center" sx={{ width: '100%', height: '100%' }} p="sm">
      {status === 'pending' ? (
        <Loader />
      ) : !hasAtLeast2CatCols ? (
        <Text align="center" color="dimmed">
          Select at least 2 categorical columns to display heatmap
        </Text>
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
      )}
    </Stack>
  );
}