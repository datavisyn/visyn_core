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
  selectionCallback,
}: {
  config: IHeatmapConfig;
  columns: VisColumn[];
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
}) {
  const [isBrushEnabled, setIsBrushEnabled] = React.useState<boolean>(false);
  const { value: allColumns, status } = useAsync(getHeatmapData, [columns, config?.catColumnsSelected]);
  const hasAtLeast2CatCols = allColumns?.catColumn && allColumns?.catColumn?.length > 1;

  const margin = React.useMemo(() => {
    if (!hasAtLeast2CatCols) return { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      top: 20 / allColumns.catColumn.length,
      right: 20 / allColumns.catColumn.length,
      bottom: 100 / allColumns.catColumn.length,
      left: 100 / allColumns.catColumn.length,
    };
  }, [allColumns?.catColumn?.length, hasAtLeast2CatCols]);

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
          {allColumns.catColumn.length > 2 ? (
            <SimpleGrid cols={allColumns.catColumn.length} sx={{ width: '100%', height: '100%' }}>
              {allColumns.catColumn.map((col1) =>
                allColumns.catColumn.map((col2) => {
                  if (col1.info.id === col2.info.id) {
                    return <div key={`${col1.info.id}-${col2.info.id}`} />;
                  }
                  return (
                    <Heatmap
                      key={`${col1.info.id}-${col2.info.id}`}
                      column1={col1}
                      column2={col2}
                      margin={margin}
                      config={config}
                      isBrushEnabled={isBrushEnabled}
                      selected={selected}
                      selectionCallback={selectionCallback}
                    />
                  );
                }),
              )}
            </SimpleGrid>
          ) : (
            <Heatmap
              column1={allColumns.catColumn[0]}
              column2={allColumns.catColumn[1]}
              margin={margin}
              config={config}
              isBrushEnabled={isBrushEnabled}
              selected={selected}
              selectionCallback={selectionCallback}
            />
          )}
        </>
      )}
    </Stack>
  );
}
