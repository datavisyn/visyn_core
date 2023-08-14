import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import React, { useCallback, useMemo } from 'react';
import { EAggregateTypes } from '../interfaces';
import { XAxis } from './barComponents/XAxis';
import { YAxis } from './barComponents/YAxis';
import { GroupedBars } from './barTypes/GroupedBars';
import { SimpleBars } from './barTypes/SimpleBars';
import { StackedBars } from './barTypes/StackedBars';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, SortTypes, getBarData } from './utils';

const margin = {
  top: 30,
  bottom: 60,
  left: 60,
  right: 25,
};

export function SingleBarChart({
  allColumns,
  config,
  categoryFilter,
  title,
  selectedMap,
  selectedList,
  selectionCallback,
  isSmall = false,
  sortType,
  setSortType,
}: {
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  config: IBarConfig;
  selectedMap: Record<string, boolean>;
  selectedList: string[];
  categoryFilter?: string;
  title?: string;
  selectionCallback?: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  isSmall?: boolean;
  sortType: SortTypes;
  setSortType: (sortType: SortTypes) => void;
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
    sortType,
    config.aggregateType,
  );

  const categoryTicks = useMemo(() => {
    return categoryScale?.domain().map((value) => ({
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
    if (!normalizedCountScale) {
      return null;
    }
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

  const sortTypeCallback = useCallback(
    (label: string) => {
      if (label === config.catColumnSelected.name) {
        if (sortType === SortTypes.CAT_ASC) {
          setSortType(SortTypes.CAT_DESC);
        } else if (sortType === SortTypes.CAT_DESC) {
          setSortType(SortTypes.NONE);
        } else {
          setSortType(SortTypes.CAT_ASC);
        }
      } else if (sortType === SortTypes.COUNT_ASC) {
        setSortType(SortTypes.COUNT_DESC);
      } else if (sortType === SortTypes.COUNT_DESC) {
        setSortType(SortTypes.NONE);
      } else {
        setSortType(SortTypes.COUNT_ASC);
      }
    },
    [config.catColumnSelected.name, setSortType, sortType],
  );

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
            {countScale && categoryScale ? (
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
            ) : null}
            <rect
              x={margin.left}
              y={margin.top}
              width={width - margin.left - margin.right}
              height={height - margin.top - margin.bottom}
              fill="transparent"
              onClick={(e) => selectionCallback(e, [])}
            />

            {countScale && categoryScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <YAxis
                  compact={isSmall}
                  yScale={countScale}
                  xRange={[categoryScale.range()[1], categoryScale.range()[0]]}
                  horizontalPosition={margin.left}
                  showLines
                  label={
                    config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                      ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                      : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                  }
                  ticks={countTicks}
                  arrowDesc={sortType === SortTypes.COUNT_DESC}
                  arrowAsc={sortType === SortTypes.COUNT_ASC}
                  sortType={sortType}
                  setSortType={sortTypeCallback}
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
                  arrowDesc={sortType === SortTypes.CAT_DESC}
                  arrowAsc={sortType === SortTypes.CAT_ASC}
                  sortType={sortType}
                  setSortType={sortTypeCallback}
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
                  arrowDesc={sortType === SortTypes.CAT_DESC}
                  arrowAsc={sortType === SortTypes.CAT_ASC}
                  sortType={sortType}
                  setSortType={sortTypeCallback}
                />
              ) : (
                <XAxis
                  compact={isSmall}
                  xScale={countScale}
                  yRange={[categoryScale.range()[1], categoryScale.range()[0]]}
                  vertPosition={height - margin.bottom}
                  label={
                    config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                      ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                      : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                  }
                  showLines
                  ticks={countTicks}
                  arrowDesc={sortType === SortTypes.COUNT_DESC}
                  arrowAsc={sortType === SortTypes.COUNT_ASC}
                  sortType={sortType}
                  setSortType={sortTypeCallback}
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
                  aggregateType={config.aggregateType}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                  aggregateColumnName={config.aggregateColumn?.name}
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
                  aggregateType={config.aggregateType}
                  aggregateColumnName={config.aggregateColumn?.name}
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
                aggregateType={config.aggregateType}
                isVertical={config.direction === EBarDirection.VERTICAL}
                aggregateColumnName={config.aggregateColumn?.name}
              />
            )}
          </g>
        </svg>
      </Container>
    </Box>
  );
}
