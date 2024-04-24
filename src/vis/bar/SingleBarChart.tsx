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
import { getBarData } from './utils';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, SortTypes } from './interfaces';

const margin = {
  top: 30,
  bottom: 60,
  left: 60,
  right: 25,
};

export function SingleBarChart({
  allColumns,
  categoryFilter,
  config,
  isSmall = false,
  selectedList,
  selectedMap,
  selectionCallback,
  setSortType,
  sortType,
  title,
}: {
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  categoryFilter?: string;
  config: IBarConfig;
  isSmall?: boolean;
  selectedList: string[];
  selectedMap: Record<string, boolean>;
  selectionCallback?: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  setSortType: (sortType: SortTypes) => void;
  sortType: SortTypes;
  title?: string;
}) {
  const [ref, { height, width }] = useResizeObserver();

  const { aggregatedTable, categoryValueScale, categoryCountScale, groupColorScale, groupScale, groupedTable, numericalValueScale, numericalIdScale } =
    useGetGroupedBarScales({
      aggregateType: config.aggregateType,
      allColumns,
      categoryFilter,
      groupType: config.groupType,
      height,
      isVertical: config.direction === EBarDirection.VERTICAL,
      margin,
      selectedMap,
      sortType,
      width,
    });

  const categoryTicks = useMemo(() => {
    return categoryValueScale?.domain().map((value) => ({
      value,
      offset: categoryValueScale(value) + categoryValueScale.bandwidth() / 2,
    }));
  }, [categoryValueScale]);

  const numericalTicks = useMemo(() => {
    const domain = numericalValueScale?.domain();
    return domain?.map((value) => ({
      value,
      offset: 0,
    }));
  }, [numericalValueScale]);

  const normalizedCountScale = useMemo(() => {
    if (config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group) {
      return categoryCountScale.copy().domain([0, 1]);
    }
    return categoryCountScale;
  }, [config.display, config.group, config.groupType, categoryCountScale]);

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
      if (label === config.catColumnSelected?.name) {
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
    [config.catColumnSelected?.name, setSortType, sortType],
  );

  return (
    <Box ref={ref} style={{ maxWidth: '100%', maxHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <Container
        fluid
        pl={0}
        pr={0}
        style={{
          height,
          width: '100%',
          '.overlay': {
            cursor: 'default !important',
          },
        }}
      >
        <svg width={width} height={height}>
          <g>
            {categoryCountScale && categoryValueScale ? (
              <text
                dominantBaseline="middle"
                style={{ fontWeight: 500, fill: '#505459' }}
                textAnchor="middle"
                transform={`translate(${config.direction === EBarDirection.VERTICAL ? (categoryValueScale.range()[0] + categoryValueScale.range()[1]) / 2 : (categoryCountScale.range()[0] + categoryCountScale.range()[1]) / 2}, ${margin.top - 20})`}
              >
                {title}
              </text>
            ) : null}
            <rect
              fill="transparent"
              height={height - margin.top - margin.bottom}
              onClick={(e) => selectionCallback(e, [])}
              width={width - margin.left - margin.right}
              x={margin.left}
              y={margin.top}
            />

            {categoryCountScale && categoryValueScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <YAxis
                  arrowAsc={sortType === SortTypes.COUNT_ASC}
                  arrowDesc={sortType === SortTypes.COUNT_DESC}
                  compact={isSmall}
                  horizontalPosition={margin.left}
                  label={
                    config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                      ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                      : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                  }
                  setSortType={sortTypeCallback}
                  showLines
                  sortType={sortType}
                  ticks={countTicks}
                  xRange={[categoryValueScale.range()[1], categoryValueScale.range()[0]]}
                  yScale={allColumns?.catColVals ? categoryValueScale : allColumns?.numColVals ? numericalValueScale : null}
                />
              ) : (
                <YAxis
                  arrowAsc={sortType === SortTypes.CAT_ASC}
                  arrowDesc={sortType === SortTypes.CAT_DESC}
                  compact={isSmall}
                  horizontalPosition={margin.left}
                  label={config.catColumnSelected?.name}
                  setSortType={sortTypeCallback}
                  showLines={false}
                  sortType={sortType}
                  ticks={allColumns?.catColVals ? categoryTicks : allColumns?.numColVals ? numericalTicks : null}
                  xRange={[categoryCountScale.range()[1], categoryCountScale.range()[0]]}
                  yScale={allColumns?.catColVals ? categoryValueScale : allColumns?.numColVals ? numericalValueScale : null}
                />
              )
            ) : null}
            {categoryValueScale && categoryCountScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <XAxis
                  arrowAsc={sortType === SortTypes.CAT_ASC}
                  arrowDesc={sortType === SortTypes.CAT_DESC}
                  compact={isSmall}
                  label={config.catColumnSelected?.name}
                  setSortType={sortTypeCallback}
                  showLines={false}
                  sortType={sortType}
                  ticks={allColumns?.catColVals ? categoryTicks : allColumns?.numColVals ? numericalTicks : null}
                  vertPosition={height - margin.bottom}
                  xScale={allColumns?.catColVals ? categoryValueScale : allColumns?.numColVals ? numericalValueScale : null}
                  yRange={[categoryCountScale.range()[1], categoryCountScale.range()[0]]}
                />
              ) : (
                <XAxis
                  arrowAsc={sortType === SortTypes.COUNT_ASC}
                  arrowDesc={sortType === SortTypes.COUNT_DESC}
                  compact={isSmall}
                  label={
                    config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                      ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                      : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                  }
                  setSortType={sortTypeCallback}
                  showLines
                  sortType={sortType}
                  ticks={countTicks}
                  vertPosition={height - margin.bottom}
                  xScale={allColumns?.catColVals ? categoryValueScale : allColumns?.numColVals ? numericalValueScale : null}
                  yRange={[categoryValueScale.range()[1], categoryValueScale.range()[0]]}
                />
              )
            ) : null}
            {config.group ? (
              config.groupType === EBarGroupingType.GROUP ? (
                <GroupedBars
                  aggregateColumnName={config.aggregateColumn?.name}
                  aggregateType={config.aggregateType}
                  categoryName={config.catColumnSelected?.name}
                  categoryScale={categoryValueScale}
                  countScale={categoryCountScale}
                  groupColorScale={groupColorScale}
                  groupedTable={groupedTable}
                  groupName={config.group.name}
                  groupScale={groupScale}
                  hasSelected={selectedList.length > 0}
                  height={height}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                  margin={margin}
                  selectionCallback={selectionCallback}
                  width={width}
                />
              ) : (
                <StackedBars
                  aggregateColumnName={config.aggregateColumn?.name}
                  aggregateType={config.aggregateType}
                  categoryName={config.catColumnSelected?.name}
                  categoryScale={categoryValueScale}
                  countScale={categoryCountScale}
                  groupColorScale={groupColorScale}
                  groupedTable={groupedTable}
                  groupName={config.group.name}
                  hasSelected={selectedList.length > 0}
                  height={height}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                  margin={margin}
                  normalized={config.display === EBarDisplayType.NORMALIZED}
                  selectionCallback={selectionCallback}
                  width={width}
                />
              )
            ) : (
              <SimpleBars
                aggregateColumnName={config.aggregateColumn?.name}
                aggregatedTable={aggregatedTable}
                aggregateType={config.aggregateType}
                categoryName={config.catColumnSelected?.name}
                numericalName={config.numColumnsSelected?.[0]?.name}
                categoryValueScale={categoryValueScale}
                categoryCountScale={categoryCountScale}
                hasSelected={selectedList.length > 0}
                height={height}
                isVertical={config.direction === EBarDirection.VERTICAL}
                margin={margin}
                numericalIdScale={numericalIdScale}
                numericalValueScale={numericalValueScale}
                selectionCallback={selectionCallback}
                width={width}
              />
            )}
          </g>
        </svg>
      </Container>
    </Box>
  );
}
