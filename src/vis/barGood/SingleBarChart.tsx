import React, { useEffect, useMemo, useRef, useState } from 'react';
import { all, desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EColumnTypes, IBarConfig, VisColumn } from '../interfaces';
import { useSyncedRef } from '../../hooks/useSyncedRef';
import { useAsync } from '../../hooks/useAsync';
import { getBarData } from './utils';
import { YAxis } from './barComponents/YAxis';
import { XAxis } from './barComponents/XAxis';
import { GroupedBars } from './barTypes/GroupedBars';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { SimpleBars } from './barTypes/SimpleBars';
import { StackedBars } from './barTypes/StackedBars';
import { Legend } from './barComponents/Legend';

const margin = {
  top: 30,
  bottom: 60,
  left: 50,
  right: 25,
};

export function SingleBarChart({
  allColumns,
  config,
  columns,
  categoryFilter,
  title,
  selectedMap,
  selectedList,
  selectionCallback,
  isSmall = false,
}: {
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  config: IBarConfig;
  columns: VisColumn[];
  selectedMap: Record<string, boolean>;
  selectedList: string[];
  categoryFilter?: string;
  title?: string;
  selectionCallback?: (ids: string[]) => void;
  isSmall?: boolean;
}) {
  const [ref, { height, width }] = useResizeObserver();

  const { aggregatedTable, categoryScale, countScale, groupColorScale, groupScale, groupedTable } = useGetGroupedBarScales(
    allColumns,
    height,
    width,
    margin,
    categoryFilter,
    config.direction === EBarDirection.VERTICAL,
    selectedMap,
    config.groupType,
  );

  const categoryTicks = useMemo(() => {
    return categoryScale.domain().map((value) => ({
      value,
      offset: categoryScale(value) + categoryScale.bandwidth() / 2,
    }));
  }, [categoryScale]);

  const normalizedCountScale = useMemo(() => {
    if (config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group) {
      return countScale.copy().domain([0, 1]);
    }
    return countScale;
  }, [config.display, config.group, config.groupType, countScale]);

  const countTicks = useMemo(() => {
    if (config.direction !== EBarDirection.VERTICAL) {
      const newScale = normalizedCountScale.copy().domain([normalizedCountScale.domain()[1], normalizedCountScale.domain()[0]]);
      return newScale.ticks(5).map((value) => ({
        value,
        offset: newScale(value),
      }));
    }
    return normalizedCountScale.ticks(5).map((value) => ({
      value,
      offset: normalizedCountScale(value),
    }));
  }, [config.direction, normalizedCountScale]);

  return (
    <Box ref={ref} style={{ maxWidth: '100%', maxHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <Container
        fluid
        pl={0}
        pr={0}
        sx={{
          height,
          width: '100%',
          '.overlay': {
            cursor: 'default !important',
          },
        }}
      >
        <svg width={width} height={height}>
          <g>
            <text
              dominantBaseline="middle"
              style={{ fontWeight: 500, fill: '#505459' }}
              textAnchor="middle"
              transform={`translate(${
                config.direction === EBarDirection.VERTICAL
                  ? (categoryScale.range()[0] + categoryScale.range()[1]) / 2
                  : (countScale.range()[0] + countScale.range()[1]) / 2
              }, ${margin.top - 20})`}
            >
              {title}
            </text>
            {countScale && categoryScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <YAxis
                  compact={isSmall}
                  yScale={countScale}
                  xRange={[categoryScale.range()[1], categoryScale.range()[0]]}
                  horizontalPosition={margin.left}
                  showLines
                  label={config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group ? 'Count %' : 'Count'}
                  ticks={countTicks}
                />
              ) : (
                <YAxis
                  compact={isSmall}
                  yScale={categoryScale}
                  xRange={[countScale.range()[1], countScale.range()[0]]}
                  horizontalPosition={margin.left}
                  showLines={false}
                  label={config.catColumnSelected.name}
                  ticks={categoryTicks}
                />
              )
            ) : null}
            {categoryScale && countScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <XAxis
                  compact={isSmall}
                  xScale={categoryScale}
                  yRange={[countScale.range()[1], countScale.range()[0]]}
                  vertPosition={height - margin.bottom}
                  label={config.catColumnSelected.name}
                  showLines={false}
                  ticks={categoryTicks}
                />
              ) : (
                <XAxis
                  compact={isSmall}
                  xScale={countScale}
                  yRange={[categoryScale.range()[1], categoryScale.range()[0]]}
                  vertPosition={height - margin.bottom}
                  label={config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group ? 'Count %' : 'Count'}
                  showLines
                  ticks={countTicks}
                />
              )
            ) : null}
            {config.group ? (
              config.groupType === EBarGroupingType.GROUP ? (
                <GroupedBars
                  categoryName={config.catColumnSelected.name}
                  groupName={config.group.name}
                  selectionCallback={selectionCallback}
                  hasSelected={selectedList.length > 0}
                  groupedTable={groupedTable}
                  groupScale={groupScale}
                  categoryScale={categoryScale}
                  countScale={countScale}
                  groupColorScale={groupColorScale}
                  width={width}
                  height={height}
                  margin={margin}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                />
              ) : (
                <StackedBars
                  categoryName={config.catColumnSelected.name}
                  groupName={config.group.name}
                  selectionCallback={selectionCallback}
                  hasSelected={selectedList.length > 0}
                  groupedTable={groupedTable}
                  categoryScale={categoryScale}
                  countScale={countScale}
                  groupColorScale={groupColorScale}
                  height={height}
                  margin={margin}
                  width={width}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                  normalized={config.display === EBarDisplayType.NORMALIZED}
                />
              )
            ) : (
              <SimpleBars
                categoryName={config.catColumnSelected.name}
                hasSelected={selectedList.length > 0}
                selectionCallback={selectionCallback}
                aggregatedTable={aggregatedTable}
                categoryScale={categoryScale}
                countScale={countScale}
                height={height}
                margin={margin}
                width={width}
                isVertical={config.direction === EBarDirection.VERTICAL}
              />
            )}
          </g>
        </svg>
      </Container>
    </Box>
  );
}
