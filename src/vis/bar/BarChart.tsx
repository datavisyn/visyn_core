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
  setConfig,
  columns,
  selectedMap,
  selectedList,
  selectionCallback,
  uniquePlotId,
  showDownloadScreenshot,
}: Pick<
  ICommonVisProps<IBarConfig>,
  'config' | 'setConfig' | 'columns' | 'selectedMap' | 'selectedList' | 'selectionCallback' | 'uniquePlotId' | 'showDownloadScreenshot'
>) {
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

  const allUniqueFacetVals = useMemo(() => {
    return [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => v.val))] as string[];
  }, [allColumns?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = useMemo(() => {
    return typeof config.focusFacetIndex === 'number' ? [allUniqueFacetVals[config.focusFacetIndex]] : allUniqueFacetVals;
  }, [allUniqueFacetVals, config.focusFacetIndex]);

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

        <Box style={{ display: 'flex', flex: 1, height: groupColorScale ? 'calc(100% - 30px)' : '100%' }}>
          {colsStatus !== 'success' ? (
            <Center>
              <Loader />
            </Center>
          ) : !config.facets || !allColumns.facetsColVals ? (
            <SingleBarChart
              config={config}
              setConfig={setConfig}
              allColumns={allColumns}
              selectedMap={selectedMap}
              selectionCallback={customSelectionCallback}
              selectedList={selectedList}
              sortType={sortType}
              setSortType={setSortType}
              legendHeight={legendBoxRef?.current?.getBoundingClientRect().height || 0}
            />
          ) : (
            <Box
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(filteredUniqueFacetVals.length)), 5)}, 1fr)`,
                gridTemplateRows: `repeat(${Math.min(Math.ceil(Math.sqrt(filteredUniqueFacetVals.length)), 5)}, 1fr)`,
                maxHeight: '100%',
              }}
            >
              {filteredUniqueFacetVals.map((multiplesVal) => (
                <SingleBarChart
                  isSmall
                  index={allUniqueFacetVals.indexOf(multiplesVal)} // use the index of the original list to return back to the grid
                  selectedList={selectedList}
                  selectedMap={selectedMap}
                  key={multiplesVal as string}
                  config={config}
                  setConfig={setConfig}
                  allColumns={allColumns}
                  categoryFilter={multiplesVal}
                  title={multiplesVal}
                  selectionCallback={customSelectionCallback}
                  sortType={sortType}
                  setSortType={setSortType}
                  legendHeight={legendBoxRef?.current?.getBoundingClientRect().height || 0}
                />
              ))}
            </Box>
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
