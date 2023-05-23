import React, { useMemo } from 'react';
import { Box, Loader, SimpleGrid } from '@mantine/core';
import { IBarConfig, VisColumn } from '../interfaces';
import { SingleBarChart } from './SingleBarChart';
import { useAsync } from '../../hooks/useAsync';
import { getBarData } from './utils';

export function BarChart({
  config,
  columns,
  selectedMap,
  selectedList,
  selectionCallback,
}: {
  config: IBarConfig;
  columns: VisColumn[];
  selectedMap: Record<string, boolean>;
  selectedList: string[];
  selectionCallback?: (ids: string[]) => void;
}) {
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [columns, config.catColumnSelected, config.group, config.multiples]);

  const uniqueMultiplesVals = useMemo(() => {
    return [...new Set(allColumns?.multiplesColVals?.resolvedValues.map((v) => v.val))] as string[];
  }, [allColumns]);

  return (
    <Box style={{ width: '100%', height: '100%' }}>
      <SimpleGrid style={{ height: '100%' }} cols={Math.round(Math.sqrt(uniqueMultiplesVals.length))} spacing={0}>
        {colsStatus !== 'success' ? (
          <Loader />
        ) : !config.multiples || !allColumns.multiplesColVals ? (
          <SingleBarChart
            config={config}
            columns={columns}
            allColumns={allColumns}
            selectedMap={selectedMap}
            selectionCallback={selectionCallback}
            selectedList={selectedList}
          />
        ) : (
          uniqueMultiplesVals.map((multiplesVal) => (
            <SingleBarChart
              selectedList={selectedList}
              selectedMap={selectedMap}
              key={multiplesVal as string}
              config={config}
              columns={columns}
              allColumns={allColumns}
              categoryFilter={multiplesVal}
              title={multiplesVal}
              selectionCallback={selectionCallback}
            />
          ))
        )}
      </SimpleGrid>
    </Box>
  );
}
