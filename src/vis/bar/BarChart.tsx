import { Box, Center, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues } from 'd3v7';
import { uniqueId, zipWith } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { categoricalColors as colorScale } from '../../utils/colors';
import { useAsync } from '../../hooks/useAsync';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { getLabelOrUnknown } from '../general/utils';
import { EColumnTypes, ICommonVisProps } from '../interfaces';
import { SingleEChartsBarChart } from './SingleEChartsBarChart';
import { FocusFacetSelector } from './barComponents/FocusFacetSelector';
import { Legend } from './barComponents/Legend';
import { IBarConfig, SortTypes } from './interfaces';
import { getBarData } from './utils';

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
  const [resizeObserverRef, { height }] = useResizeObserver();
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

  const dataTable = useMemo(() => {
    if (!allColumns) {
      return [];
    }

    return zipWith(
      allColumns.catColVals?.resolvedValues,
      allColumns.aggregateColVals?.resolvedValues,
      allColumns.groupColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.facetsColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      (cat, agg, group, facet) => {
        return {
          id: cat.id,
          category: getLabelOrUnknown(cat?.val),
          agg: agg?.val as number,
          group: typeof group?.val === 'number' ? String(group?.val) : getLabelOrUnknown(group?.val),
          facet: getLabelOrUnknown(facet?.val),
        };
      },
    );
  }, [allColumns]);

  const groupColorScale = useMemo(() => {
    if (!allColumns?.groupColVals) {
      return null;
    }

    const groups = Array.from(new Set(dataTable.map((row) => row.group))).sort();
    const range =
      allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? schemeBlues[Math.max(groups.length, 3)] // use at least 3 colors for numerical values
        : groups.map(
            (group, i) => allColumns?.groupColVals?.color?.[group] || colorScale[i % colorScale.length], // use the custom color from the column if available, otherwise use the default color scale
          );

    return scaleOrdinal<string>().domain(groups).range(range);
  }, [allColumns?.groupColVals, dataTable]);

  const allUniqueFacetVals = useMemo(() => {
    return [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => getLabelOrUnknown(v.val)))] as string[];
  }, [allColumns?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = useMemo(() => {
    return typeof config.focusFacetIndex === 'number' && config.focusFacetIndex < allUniqueFacetVals.length
      ? [allUniqueFacetVals[config.focusFacetIndex]]
      : allUniqueFacetVals;
  }, [allUniqueFacetVals, config.focusFacetIndex]);

  // const [legendBoxRef] = useResizeObserver();

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
    <Stack data-testid="vis-bar-chart-container" flex={1} style={{ width: '100%', height: '100%' }} ref={resizeObserverRef}>
      {showDownloadScreenshot || config.showFocusFacetSelector === true ? (
        <Group justify="center">
          {config.showFocusFacetSelector === true ? <FocusFacetSelector config={config} setConfig={setConfig} facets={allUniqueFacetVals} /> : null}
          {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config} /> : null}
        </Group>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: showDownloadScreenshot ? 'calc(100% - 20px)' : '100%' }}>
        {/* <Box ref={legendBoxRef}>
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
        </Box> */}

        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : !config.facets || !allColumns.facetsColVals ? (
          // <SingleBarChart
          //   config={config}
          //   setConfig={setConfig}
          //   allColumns={allColumns}
          //   selectedMap={selectedMap}
          //   selectionCallback={customSelectionCallback}
          //   selectedList={selectedList}
          //   sortType={sortType}
          //   setSortType={setSortType}
          //   legendHeight={legendBoxRef?.current?.getBoundingClientRect().height || 0}
          // />
          <SingleEChartsBarChart
            config={config}
            dataTable={dataTable}
            setConfig={setConfig}
            selectionCallback={customSelectionCallback}
            groupColorScale={groupColorScale}
            // allColumns={allColumns}
            // selectedMap={selectedMap}
            // selectedList={selectedList}
            // sortType={sortType}
            // setSortType={setSortType}
          />
        ) : (
          <ScrollArea.Autosize mah={height}>
            <Stack gap="xl" style={{ width: '100%' }}>
              {filteredUniqueFacetVals.map((multiplesVal) => (
                // <SingleBarChart
                //   isSmall
                //   index={allUniqueFacetVals.indexOf(multiplesVal)} // use the index of the original list to return back to the grid
                //   selectedList={selectedList}
                //   selectedMap={selectedMap}
                //   key={multiplesVal as string}
                //   config={config}
                //   setConfig={setConfig}
                //   allColumns={allColumns}
                //   categoryFilter={multiplesVal === NAN_REPLACEMENT ? null : multiplesVal}
                //   title={multiplesVal}
                //   selectionCallback={customSelectionCallback}
                //   sortType={sortType}
                //   setSortType={setSortType}
                //   legendHeight={legendBoxRef?.current?.getBoundingClientRect().height || 0}
                // />
                <SingleEChartsBarChart
                  key={multiplesVal as string}
                  config={config}
                  dataTable={dataTable}
                  selectedFacetValue={multiplesVal}
                  selectedFacetIndex={allUniqueFacetVals.indexOf(multiplesVal)} // use the index of the original list to return back to the grid
                  setConfig={setConfig}
                  selectionCallback={customSelectionCallback}
                  groupColorScale={groupColorScale}
                  // selectedMap={selectedMap}
                  // selectedList={selectedList}
                  // sortType={sortType}
                  // setSortType={setSortType}
                />
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Stack>
  );
}
