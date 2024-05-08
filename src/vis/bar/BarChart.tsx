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
    config.facets,
    config.aggregateColumn,
  ]);

  const [sortType, setSortType] = React.useState<SortTypes>(SortTypes.NONE);

  const uniqueFacetVals = useMemo(() => {
    return [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => v.val))] as string[];
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
    <Stack style={{ width: '100%', height: '100%', position: 'relative' }} gap={0} mt="md">
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
            onClick={() => null}
            stepSize={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? groupedTable.get('group_max', 0) - groupedTable.get('group', 0) : 0}
          />
        ) : null}
      </Box>
      <SimpleGrid cols={Math.min(Math.ceil(Math.sqrt(uniqueFacetVals.length)), 5)} spacing={0} style={{ height: 'inherit', overflow: 'hidden' }}>
        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : !config.facets || !allColumns.facetsColVals ? (
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
          uniqueFacetVals.map((facetsVal) => (
            <SingleBarChart
              isSmall
              selectedList={selectedList}
              selectedMap={selectedMap}
              key={facetsVal as string}
              config={config}
              allColumns={allColumns}
              categoryFilter={facetsVal}
              title={facetsVal}
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
