import { Box, Center, Loader, SimpleGrid, Stack } from '@mantine/core';
import { op } from 'arquero';
import { uniqueId } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { EColumnTypes, ICommonVisProps } from '../interfaces';
import { SingleBarChart } from './SingleBarChart';
import { Legend } from './barComponents/Legend';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { IBarConfig, SortTypes } from './interfaces';
import { experimentalGetBarData, getBarData } from './utils';

export function BarChart({
  columns,
  config,
  selectedList,
  selectedMap,
  selectionCallback,
  showDownloadScreenshot,
  uniquePlotId,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'columns' | 'selectedMap' | 'selectedList' | 'selectionCallback' | 'uniquePlotId' | 'showDownloadScreenshot'>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('BarChartVis'), [uniquePlotId]);
  const [filteredOut, setFilteredOut] = React.useState<string[]>([]);
  const [sortType, setSortType] = React.useState<SortTypes>(SortTypes.NONE);

  // const { value: allColumns, status: colsStatus } = useAsync(getBarData, [
  //   {
  //     columns,
  //     catColumn: config.catColumnSelected,
  //     numColumn: config.numColumnSelected,
  //     groupColumn: config.group,
  //     facetsColumn: config.facets,
  //     aggregateColumn: config.aggregateColumn,
  //   },
  // ]);

  // const uniqueFacetVals = useMemo(() => [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => v.val))] as string[], [allColumns]);

  // const { groupColorScale, groupedTable } = useGetGroupedBarScales({
  //   aggregateType: config.aggregateType,
  //   allColumns,
  //   categoryFilter: null,
  //   groupType: config.groupType,
  //   height: 0,
  //   isVertical: true,
  //   margin: { left: 0, top: 0, right: 0, bottom: 0 },
  //   selectedMap,
  //   sortType,
  //   width: 0,
  // });

  // const groupedIds = useMemo(() => {
  //   if (!groupedTable) {
  //     return [];
  //   }
  //   return groupedTable
  //     .groupby('group')
  //     .rollup({ ids: op.array_agg('ids') })
  //     .objects()
  //     .map((val: { group: string; ids: string[][] }) => ({ group: val.group, ids: val.ids.flat() }));
  // }, [groupedTable]);

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

  // NOTE: @dv-usama-ansari: Experimental section starts

  const { value: experimentalBarDataColumns, status: experimentalBarDataStatus } = useAsync(experimentalGetBarData, [
    {
      columns,
      config,
    },
  ]);

  const uniqueFacetVals = useMemo(
    () => [...new Set(experimentalBarDataColumns?.awaitedFacetsColumnValues?.resolvedValues.map((v) => v.val))] as string[],
    [experimentalBarDataColumns],
  );

  // NOTE: @dv-usama-ansari: Experimental section ends

  return (
    <Stack pr="40px" flex={1} style={{ width: '100%', height: '100%' }}>
      {showDownloadScreenshot ? (
        <Center h="20px">
          <DownloadPlotButton uniquePlotId={id} config={config} />
        </Center>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: showDownloadScreenshot ? 'calc(100% - 20px)' : '100%' }}>
        {/* // TODO: @dv-usama-ansari: Implement legend when arquero aggregation is removed */}
        {/* {groupColorScale ? (
          <Box>
            <Legend
              groupedIds={groupedIds}
              left={60}
              categories={groupColorScale.domain()}
              filteredOut={filteredOut}
              isNumerical={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL}
              colorScale={groupColorScale}
              stepSize={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? groupedTable.get('group_max', 0) - groupedTable.get('group', 0) : 0}
              onFilteredOut={(newId) => {
                if (filteredOut.includes(newId)) {
                  setFilteredOut(filteredOut.filter((v) => v !== newId));
                } else {
                  setFilteredOut([...filteredOut, newId]);
                }
              }}
            />
          </Box>
        ) : null} */}

        <SimpleGrid
          cols={Math.min(Math.ceil(Math.sqrt(uniqueFacetVals.length)), 5)}
          spacing={0}
          // style={{ flex: 1, height: groupColorScale ? 'calc(100% - 30px)' : '100%' }}
          style={{ flex: 1, height: '100%' }}
        >
          {experimentalBarDataStatus !== 'success' ? (
            <Center>
              <Loader />
            </Center>
          ) : !config.facets || !experimentalBarDataColumns.awaitedFacetsColumnValues ? (
            <SingleBarChart
              experimentalBarDataColumns={experimentalBarDataColumns}
              config={config}
              // allColumns={allColumns}
              selectedMap={selectedMap}
              selectionCallback={customSelectionCallback}
              selectedList={selectedList}
              sortType={sortType}
              setSortType={setSortType}
            />
          ) : (
            uniqueFacetVals.map((multiplesVal) => (
              <SingleBarChart
                isSmall
                selectedList={selectedList}
                selectedMap={selectedMap}
                key={multiplesVal as string}
                config={config}
                // TODO: @dv-usama-ansari: use `experimentalBarDataColumns` instead of `allColumns` for facets
                // allColumns={allColumns}
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
    </Stack>
  );
}
