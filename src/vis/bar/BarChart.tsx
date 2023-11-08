import { Box, Loader, SimpleGrid, Stack, Center } from '@mantine/core';
import { op } from 'arquero';
import React, { useCallback, useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { EColumnTypes, VisColumn } from '../interfaces';
import { SingleBarChart } from './SingleBarChart';
import { Legend } from './barComponents/Legend';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { getBarData } from './utils';
import { IBarConfig, SortTypes } from './interfaces';

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
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [
    columns,
    config.catColumnSelected,
    config.group,
    config.multiples,
    config.aggregateColumn,
  ]);

  const [sortType, setSortType] = React.useState<SortTypes>(SortTypes.NONE);

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
    sortType,
    config.aggregateType,
  );

  const groupedIds = useMemo(() => {
    if (!groupedTable) {
      return [];
    }
    return groupedTable
      .groupby('group')
      .rollup({ ids: op.array_agg('ids') })
      .objects()
      .map((val: { group: string; ids: string[][] }) => ({ group: val.group, ids: val.ids.flat() }));
  }, [groupedTable]);

  const customSelectionCallback = useCallback(
    (e: React.MouseEvent<SVGGElement | HTMLDivElement, MouseEvent>, ids: string[]) => {
      if (e.ctrlKey) {
        selectionCallback([...new Set([...selectedList, ...ids])]);
        return;
      }
      if (selectionCallback) {
        if (selectedList.length === ids.length && selectedList.every((value, index) => value === ids[index])) {
          selectionCallback([]);
        } else {
          selectionCallback(ids);
        }
      }
    },
    [selectedList, selectionCallback],
  );

  return (
    <Stack style={{ width: '100%', height: '100%', position: 'relative' }} gap={0}>
      <Box style={{ height: '30px' }}>
        {groupColorScale ? (
          <Legend
            groupedIds={groupedIds}
            selectedList={selectedList}
            selectionCallback={customSelectionCallback}
            left={60}
            categories={groupColorScale.domain()}
            isNumerical={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL}
            colorScale={groupColorScale}
            height={30}
            onClick={() => console.log('hello')}
            stepSize={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? groupedTable.get('group_max', 0) - groupedTable.get('group', 0) : 0}
          />
        ) : null}
      </Box>
      <SimpleGrid cols={Math.round(Math.sqrt(uniqueMultiplesVals.length))} spacing={0} style={{ height: 'inherit', overflow: 'hidden' }}>
        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : !config.multiples || !allColumns.multiplesColVals ? (
          <SingleBarChart
            config={config}
            allColumns={allColumns}
            selectedMap={selectedMap}
            selectionCallback={customSelectionCallback}
            selectedList={selectedList}
            sortType={sortType}
            setSortType={setSortType}
          />
        ) : (
          uniqueMultiplesVals.map((multiplesVal) => (
            <SingleBarChart
              isSmall
              selectedList={selectedList}
              selectedMap={selectedMap}
              key={multiplesVal as string}
              config={config}
              allColumns={allColumns}
              categoryFilter={multiplesVal}
              title={multiplesVal}
              selectionCallback={customSelectionCallback}
              sortType={sortType}
              setSortType={setSortType}
            />
          ))
        )}
      </SimpleGrid>
    </Stack>
  );
}
