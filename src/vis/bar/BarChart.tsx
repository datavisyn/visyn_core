import { Box, Loader, SimpleGrid, Stack, Center } from '@mantine/core';
import { op } from 'arquero';
import React, { useCallback, useMemo } from 'react';
import { uniqueId } from 'lodash';
import { useResizeObserver } from '@mantine/hooks';
import { useAsync } from '../../hooks/useAsync';
import { EColumnTypes, ICommonVisProps } from '../interfaces';
import { SingleBarChart } from './SingleBarChart';
import { Legend } from './barComponents/Legend';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { getBarData } from './utils';
import { IBarConfig, SortTypes } from './interfaces';
import { DownloadPlotButton } from '../general/DownloadPlotButton';

export function BarChart({
  config,
  columns,
  selectedMap,
  selectedList,
  selectionCallback,
  uniquePlotId,
  showDownloadScreenshot,
}: Pick<ICommonVisProps<IBarConfig>, 'config' | 'columns' | 'selectedMap' | 'selectedList' | 'selectionCallback' | 'uniquePlotId' | 'showDownloadScreenshot'>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('BarChartVis'), [uniquePlotId]);
  const [filteredOut, setFilteredOut] = React.useState<string[]>([]);
  const [sortType, setSortType] = React.useState<SortTypes>(SortTypes.NONE);

  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [
    columns,
    config.catColumnSelected,
    config.group,
    config.facets,
    config.aggregateColumn,
  ]);

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

  const [legendBoxRef] = useResizeObserver();

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
    <Stack pr="40px" flex={1} style={{ width: '100%', height: '100%' }}>
      {showDownloadScreenshot ? (
        <Center h="20px">
          <DownloadPlotButton uniquePlotId={id} config={config} />
        </Center>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: showDownloadScreenshot ? 'calc(100% - 20px)' : '100%' }}>
        <Box ref={legendBoxRef}>
          {groupColorScale ? (
            <Legend
              left={60}
              categories={groupColorScale.domain()}
              filteredOut={filteredOut}
              isNumerical={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL}
              colorScale={groupColorScale}
              stepSize={allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? groupedTable.get('group_max', 0) - groupedTable.get('group', 0) : 0}
              onFilteredOut={() => {}} // disable legend click for now
            />
          ) : null}
        </Box>

        <SimpleGrid
          cols={Math.min(Math.ceil(Math.sqrt(uniqueFacetVals.length)), 5)}
          spacing={0}
          style={{ flex: 1, height: groupColorScale ? 'calc(100% - 30px)' : '100%' }}
        >
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
              legendHeight={legendBoxRef?.current?.getBoundingClientRect().height || 0}
            />
          ) : (
            uniqueFacetVals.map((multiplesVal) => (
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
                legendHeight={legendBoxRef?.current?.getBoundingClientRect().height || 0}
              />
            ))
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
