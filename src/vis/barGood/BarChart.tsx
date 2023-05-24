import React, { useMemo } from 'react';
import { Box, Loader, SimpleGrid, Stack } from '@mantine/core';
import { EColumnTypes, IBarConfig, VisColumn } from '../interfaces';
import { SingleBarChart } from './SingleBarChart';
import { useAsync } from '../../hooks/useAsync';
import { getBarData } from './utils';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { Legend } from './barComponents/Legend';

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

  const { groupColorScale, groupedTable } = useGetGroupedBarScales(
    allColumns,
    0,
    0,
    { left: 0, top: 0, right: 0, bottom: 0 },
    null,
    true,
    selectedMap,
    config.groupType,
  );

  return (
    <Stack style={{ width: '100%', height: '100%', position: 'relative' }} spacing={0}>
      {groupColorScale ? (
        <Legend
          left={50}
          categories={groupColorScale.domain()}
          isNumerical={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL}
          filteredCategories={[]}
          colorScale={groupColorScale}
          height={30}
          onClick={() => console.log('hello')}
          stepSize={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? groupedTable.get('group_max', 0) - groupedTable.get('group', 0) : 0}
        />
      ) : null}
      <SimpleGrid cols={Math.round(Math.sqrt(uniqueMultiplesVals.length))} spacing={0} style={{ height: 'inherit', overflow: 'hidden' }}>
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
              isSmall
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
    </Stack>
  );
}
