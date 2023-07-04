import { Group, Loader, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import * as React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { IHeatmapConfig, VisColumn } from '../interfaces';
import { getHeatmapData } from './utils';
import { Heatmap } from './Heatmap';

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
  const [isBrushEnabled, setIsBrushEnabled] = React.useState<boolean>(false);
  const { value: allColumns, status } = useAsync(getHeatmapData, [columns, config?.catColumnsSelected]);
  const hasAtLeast2CatCols = allColumns?.catColumn && allColumns?.catColumn?.length > 1;

  const margin = React.useMemo(() => {
    return {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    };
  }, []);

  return (
    <Stack align="center" justify="center" sx={{ width: '100%', height: '100%' }}>
      {status === 'pending' ? (
        <Loader />
      ) : !hasAtLeast2CatCols ? (
        <Text align="center" color="dimmed">
          Select at least 2 categorical columns to display heatmap
        </Text>
      ) : (
        <>
          <Group position="right" sx={{ width: '100%' }} mr={margin.right}>
            <Switch size="xs" label="Enable brush" checked={isBrushEnabled} onChange={(event) => setIsBrushEnabled(event.currentTarget.checked)} />
          </Group>
          <Heatmap
            column1={allColumns.catColumn[0]}
            column2={allColumns.catColumn[1]}
            margin={margin}
            config={config}
            isBrushEnabled={isBrushEnabled}
            selected={selected}
            setExternalConfig={setExternalConfig}
            selectionCallback={selectionCallback}
          />
        </>
      )}
    </Stack>
  );
}
