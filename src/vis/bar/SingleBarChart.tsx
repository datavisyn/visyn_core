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
import { ESortStates } from '../general/SortIcon';
import { getLabelOrUnknown } from '../general/utils';

/**
 * Return the margin object and adjust the bottom offset which also defines the lenght of the rotated labels
 * @param rotatAxisLabel if set to true, the labels on the x-axis have 80 px offset from the bottom. Otherwise, 60 px.
 * @returns the margin object with the top, bottom, left and right offsets
 */
const getMargin = (rotatAxisLabel: boolean) => ({
  top: 30,
  bottom: rotatAxisLabel ? 80 : 60,
  left: 60,
  right: 25,
});

export function SingleBarChart({
  index,
  allColumns,
  config,
  setConfig,
  categoryFilter,
  title,
  selectedMap,
  selectedList,
  selectionCallback,
  isSmall = false,
  legendHeight,
}: {
  index?: number;
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  config: IBarConfig;
  setConfig: (config: IBarConfig) => void;
  selectedMap: Record<string, boolean>;
  selectedList: string[];
  categoryFilter?: string;
  title?: string;
  selectionCallback?: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[], label?: string) => void;
  isSmall?: boolean;
  legendHeight: number;
}) {
  const [ref, { height, width }] = useResizeObserver();
  const [rotateXAxisTicks, setRotateXAxisTicks] = React.useState(false);

  const { aggregatedTable, categoryScale, countScale, groupColorScale, groupScale, groupedTable } = useGetGroupedBarScales(
    allColumns,
    height - legendHeight,
    width,
    getMargin(rotateXAxisTicks),
    categoryFilter,
    config.direction === EBarDirection.VERTICAL,
    selectedMap,
    config.groupType,
    config.sortType,
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
    (label: string, nextSortState: ESortStates) => {
      if (label === config.catColumnSelected.name) {
        if (nextSortState === ESortStates.ASC) {
          setConfig({ ...config, sortType: SortTypes.CAT_ASC });
        } else if (nextSortState === ESortStates.DESC) {
          setConfig({ ...config, sortType: SortTypes.CAT_DESC });
        } else {
          setConfig({ ...config, sortType: SortTypes.NONE });
        }
      } else if (nextSortState === ESortStates.ASC) {
        setConfig({ ...config, sortType: SortTypes.COUNT_ASC });
      } else if (nextSortState === ESortStates.DESC) {
        setConfig({ ...config, sortType: SortTypes.COUNT_DESC });
      } else {
        setConfig({ ...config, sortType: SortTypes.NONE });
      }
    },
    [config, setConfig],
  );

  return (
    <Box ref={ref} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
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
            {countScale && categoryScale && title !== undefined ? (
              <text
                dominantBaseline="middle"
                style={{ fontWeight: 500, fill: '#505459', cursor: 'pointer' }}
                textAnchor="middle"
                transform={`translate(${
                  config.direction === EBarDirection.VERTICAL
                    ? (categoryScale.range()[0] + categoryScale.range()[1]) / 2
                    : (countScale.range()[0] + countScale.range()[1]) / 2
                }, ${getMargin(rotateXAxisTicks).top - 20})`}
                onClick={() => {
                  setConfig({ ...config, focusFacetIndex: config.focusFacetIndex === index ? null : index });
                }}
              >
                {getLabelOrUnknown(title)}
              </text>
            ) : null}
            <rect
              x={getMargin(rotateXAxisTicks).left}
              y={getMargin(rotateXAxisTicks).top}
              width={width - getMargin(rotateXAxisTicks).left - getMargin(rotateXAxisTicks).right}
              height={height - getMargin(rotateXAxisTicks).top - getMargin(rotateXAxisTicks).bottom - legendHeight}
              fill="transparent"
              onClick={(e) => selectionCallback(e, [])}
            />

            {countScale && categoryScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <YAxis
                  compact={isSmall}
                  yScale={countScale}
                  xRange={[categoryScale.range()[1], categoryScale.range()[0]]}
                  horizontalPosition={getMargin(rotateXAxisTicks).left}
                  showLines
                  label={
                    config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                      ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                      : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                  }
                  ticks={countTicks}
                  sortedDesc={config.sortType === SortTypes.COUNT_DESC}
                  sortedAsc={config.sortType === SortTypes.COUNT_ASC}
                  setSortType={sortTypeCallback}
                />
              ) : (
                <YAxis
                  compact={isSmall}
                  yScale={categoryScale}
                  xRange={[countScale.range()[1], countScale.range()[0]]}
                  horizontalPosition={getMargin(rotateXAxisTicks).left}
                  label={config.catColumnSelected.name}
                  ticks={categoryTicks}
                  sortedDesc={config.sortType === SortTypes.CAT_DESC}
                  sortedAsc={config.sortType === SortTypes.CAT_ASC}
                  setSortType={sortTypeCallback}
                />
              )
            ) : null}
            {categoryScale && countScale ? (
              config.direction === EBarDirection.VERTICAL ? (
                <XAxis
                  compact={isSmall}
                  shouldRotate={rotateXAxisTicks}
                  xScale={categoryScale}
                  yRange={[countScale.range()[1], countScale.range()[0]]}
                  vertPosition={height - getMargin(rotateXAxisTicks).bottom - legendHeight}
                  label={config.catColumnSelected.name}
                  ticks={categoryTicks}
                  sortedDesc={config.sortType === SortTypes.CAT_DESC}
                  sortedAsc={config.sortType === SortTypes.CAT_ASC}
                  setSortType={sortTypeCallback}
                  selectionCallback={selectionCallback}
                />
              ) : (
                <XAxis
                  compact={isSmall}
                  shouldRotate={rotateXAxisTicks}
                  xScale={countScale}
                  yRange={[categoryScale.range()[1], categoryScale.range()[0]]}
                  vertPosition={height - getMargin(rotateXAxisTicks).bottom - legendHeight}
                  label={
                    config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                      ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                      : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                  }
                  showLines
                  ticks={countTicks}
                  sortedDesc={config.sortType === SortTypes.COUNT_DESC}
                  sortedAsc={config.sortType === SortTypes.COUNT_ASC}
                  setSortType={sortTypeCallback}
                  selectionCallback={selectionCallback}
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
                  height={height - legendHeight}
                  margin={getMargin(rotateXAxisTicks)}
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
                  height={height - legendHeight}
                  margin={getMargin(rotateXAxisTicks)}
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
                margin={getMargin(rotateXAxisTicks)}
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
