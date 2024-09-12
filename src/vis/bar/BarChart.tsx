import { Center, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import { useElementSize } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues } from 'd3v7';
import { uniqueId, zipWith, sortBy } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors as colorScale } from '../../utils/colors';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { getLabelOrUnknown } from '../general/utils';
import { EColumnTypes, ICommonVisProps, VisNumericalValue } from '../interfaces';
import { calculateChartHeight, SingleEChartsBarChart } from './SingleEChartsBarChart';
import { FocusFacetSelector } from './barComponents/FocusFacetSelector';
import { EBarDisplayType, IBarConfig } from './interfaces';
import { createBinLookup, getBarData } from './utils';
import { BarChartSortButton } from './BarChartSortButton';

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
  const { ref: resizeObserverRef, width: containerWidth, height: containerHeight } = useElementSize();
  const id = React.useMemo(() => uniquePlotId || uniqueId('BarChartVis'), [uniquePlotId]);

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

    // bin the `group` column values if a numerical column is selected
    const binLookup: Map<VisNumericalValue, string> =
      allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? createBinLookup(allColumns.groupColVals?.resolvedValues as VisNumericalValue[]) : null;

    return zipWith(
      allColumns.catColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.aggregateColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.groupColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      allColumns.facetsColVals?.resolvedValues || [], // add array as fallback value to prevent zipWith from dropping the column
      (cat, agg, group, facet) => {
        return {
          id: cat.id,
          category: getLabelOrUnknown(cat?.val),
          agg: agg?.val as number,
          // if the group column is numerical, use the bin lookup to get the bin name, otherwise use the label or 'unknown'
          group: typeof group?.val === 'number' ? binLookup.get(group as VisNumericalValue) : getLabelOrUnknown(group?.val),
          facet: getLabelOrUnknown(facet?.val),
        };
      },
    );
  }, [allColumns]);

  const groupColorScale = useMemo(() => {
    if (!allColumns?.groupColVals) {
      return null;
    }

    const groups = Array.from(new Set(dataTable.map((row) => row.group)));
    const range =
      allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? schemeBlues[Math.max(groups.length - 1, 3)] // use at least 3 colors for numerical values
        : groups.map(
            (group, i) => allColumns?.groupColVals?.color?.[group] || colorScale[i % colorScale.length], // use the custom color from the column if available, otherwise use the default color scale
          );

    return scaleOrdinal<string>().domain(groups).range(range);
  }, [allColumns?.groupColVals, dataTable]);

  const allUniqueFacetVals = useMemo(() => {
    return [...new Set(allColumns?.facetsColVals?.resolvedValues.map((v) => getLabelOrUnknown(v.val)))] as string[];
  }, [allColumns?.facetsColVals?.resolvedValues]);

  const filteredUniqueFacetVals = useMemo(() => {
    return sortBy(
      typeof config.focusFacetIndex === 'number' && config.focusFacetIndex < allUniqueFacetVals.length
        ? [allUniqueFacetVals[config.focusFacetIndex]]
        : allUniqueFacetVals,
    );
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

  const isToolbarVisible = config?.showFocusFacetSelector || showDownloadScreenshot || config?.display !== EBarDisplayType.NORMALIZED;
  const innerHeight = containerHeight - (isToolbarVisible ? 40 : 0);

  const itemData = React.useMemo(
    () => ({
      dataTable,
      selectedList,
      selectedMap,
      groupColorScale,
      filteredUniqueFacetVals,
      config,
      setConfig,
      allUniqueFacetVals,
      customSelectionCallback,
    }),
    [dataTable, selectedList, selectedMap, customSelectionCallback, setConfig, groupColorScale, filteredUniqueFacetVals, config, allUniqueFacetVals],
  );

  const renderer = React.useCallback((props: ListChildComponentProps<typeof itemData>) => {
    const multiplesVal = props.data.filteredUniqueFacetVals[props.index];

    return (
      <div style={props.style}>
        <SingleEChartsBarChart
          config={props.data.config}
          dataTable={props.data.dataTable}
          selectedList={props.data.selectedList}
          selectedFacetValue={multiplesVal}
          selectedFacetIndex={multiplesVal ? props.data.allUniqueFacetVals.indexOf(multiplesVal) : undefined} // use the index of the original list to return back to the grid
          setConfig={props.data.setConfig}
          selectionCallback={props.data.customSelectionCallback}
          groupColorScale={props.data.groupColorScale}
          selectedMap={props.data.selectedMap}
        />
      </div>
    );
  }, []);

  return (
    <Stack data-testid="vis-bar-chart-container" flex={1} style={{ width: '100%', height: '100%' }} ref={resizeObserverRef}>
      {showDownloadScreenshot || config.showFocusFacetSelector === true ? (
        <Group justify="center">
          {config.showFocusFacetSelector === true ? <FocusFacetSelector config={config} setConfig={setConfig} facets={allUniqueFacetVals} /> : null}
          {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config} /> : null}
          {config.display !== EBarDisplayType.NORMALIZED ? <BarChartSortButton config={config} setConfig={setConfig} /> : null}
        </Group>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: innerHeight }}>
        {colsStatus !== 'success' ? (
          <Center>
            <Loader />
          </Center>
        ) : !config.facets || !allColumns.facetsColVals ? (
          <ScrollArea.Autosize h={innerHeight} w={containerWidth} scrollbars="y" offsetScrollbars style={{ overflowX: 'hidden' }}>
            <SingleEChartsBarChart
              config={config}
              dataTable={dataTable}
              selectedList={selectedList}
              setConfig={setConfig}
              selectionCallback={customSelectionCallback}
              groupColorScale={groupColorScale}
              selectedMap={selectedMap}
            />
          </ScrollArea.Autosize>
        ) : null}

        {colsStatus === 'success' && config?.facets && allColumns?.facetsColVals ? (
          <List
            height={innerHeight}
            itemCount={filteredUniqueFacetVals.length}
            itemSize={(index) => {
              return calculateChartHeight(config, dataTable, filteredUniqueFacetVals[index]);
            }}
            itemData={itemData}
            width="100%"
          >
            {renderer}
          </List>
        ) : null}
      </Stack>
    </Stack>
  );
}
