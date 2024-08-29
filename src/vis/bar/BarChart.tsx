import { Center, Group, Loader, ScrollArea, Stack } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { scaleOrdinal, schemeBlues } from 'd3v7';
import { uniqueId, zipWith } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { categoricalColors as colorScale } from '../../utils/colors';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { getLabelOrUnknown } from '../general/utils';
import { EColumnTypes, ICommonVisProps, VisNumericalValue } from '../interfaces';
import { SingleEChartsBarChart } from './SingleEChartsBarChart';
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
          {config.display !== EBarDisplayType.NORMALIZED ? <BarChartSortButton config={config} setConfig={setConfig} /> : null}
        </Group>
      ) : null}
      <Stack gap={0} id={id} style={{ width: '100%', height: showDownloadScreenshot ? 'calc(100% - 20px)' : '100%' }}>
        <ScrollArea.Autosize h={containerHeight} w={containerWidth} scrollbars="y">
          {colsStatus !== 'success' ? (
            <Center>
              <Loader />
            </Center>
          ) : !config.facets || !allColumns.facetsColVals ? (
            <SingleEChartsBarChart
              config={config}
              dataTable={dataTable}
              setConfig={setConfig}
              selectionCallback={customSelectionCallback}
              groupColorScale={groupColorScale}
              selectedMap={selectedMap}
            />
          ) : (
            <Stack gap="xl" w={containerWidth}>
              {[...filteredUniqueFacetVals]
                .sort((a, b) => a.localeCompare(b))
                .map((multiplesVal) => (
                  <SingleEChartsBarChart
                    key={multiplesVal}
                    config={config}
                    dataTable={dataTable}
                    selectedFacetValue={multiplesVal}
                    selectedFacetIndex={allUniqueFacetVals.indexOf(multiplesVal)} // use the index of the original list to return back to the grid
                    setConfig={setConfig}
                    selectionCallback={customSelectionCallback}
                    groupColorScale={groupColorScale}
                    selectedMap={selectedMap}
                  />
                ))}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Stack>
    </Stack>
  );
}
