import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import React, { useCallback, useMemo } from 'react';
import { ESortStates } from '../general/SortIcon';
import { EAggregateTypes } from '../interfaces';
import { XAxis } from './barComponents/XAxis';
import { YAxis } from './barComponents/YAxis';
import { GroupedBars } from './barTypes/GroupedBars';
import { SimpleBars } from './barTypes/SimpleBars';
import { StackedBars } from './barTypes/StackedBars';
import { useExperimentalGetGroupedBarScales, useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, SortTypes } from './interfaces';
import { experimentalGetBarData, experimentalGroupByAggregateType, getBarData } from './utils';

// bottom offset which also defines the length of the rotated labels

const getMargin = (rotatAxisLabel: boolean) => ({
  top: 30,
  bottom: rotatAxisLabel ? 80 : 60,
  left: 60,
  right: 25,
});

export function SingleBarChart({
  experimentalBarDataColumns,
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
  experimentalBarDataColumns?: Awaited<ReturnType<typeof experimentalGetBarData>>;
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
  const [shouldRotateXAxisTicks, setShouldRotateXAxisTicks] = React.useState(false);

  const { aggregatedTable, categoryCountScale, categoryValueScale, groupColorScale, groupedTable, groupScale, numericalIdScale, numericalValueScale } =
    useGetGroupedBarScales({
      aggregateType: config.aggregateType,
      allColumns,
      categoryFilter,
      groupType: config.groupType,
      height,
      isVertical: config.direction === EBarDirection.VERTICAL,
      margin: getMargin(shouldRotateXAxisTicks),
      selectedMap,
      sortType,
      width,
    });

  // const categoryValueTicks = useMemo(() => {
  //   return categoryValueScale?.domain().map((value) => ({
  //     value,
  //     offset: categoryValueScale(value) + categoryValueScale.bandwidth() / 2,
  //   }));
  // }, [categoryValueScale]);

  // const numericalIdTicks = useMemo(() => {
  //   const domain = numericalIdScale?.domain();
  //   if (numericalIdScale?.bandwidth() <= 10) {
  //     return domain?.reduce((acc, value, index) => {
  //       if (index % 3 === 0) {
  //         acc.push({
  //           value,
  //           offset: numericalIdScale(value) + numericalIdScale.bandwidth() / 2,
  //         });
  //       }
  //       return acc;
  //     }, []);
  //   }
  //   return domain?.map((value) => ({
  //     value,
  //     offset: numericalIdScale(value) + numericalIdScale.bandwidth() / 2,
  //   }));
  // }, [numericalIdScale]);

  // const normalizedCountScale = useMemo(() => {
  //   if (config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group) {
  //     return categoryCountScale.copy().domain([0, 1]);
  //   }
  //   return categoryCountScale;
  // }, [config.display, config.group, config.groupType, categoryCountScale]);

  // const categoryCountTicks = useMemo(() => {
  //   if (!normalizedCountScale) {
  //     return null;
  //   }
  //   if (config.direction !== EBarDirection.VERTICAL) {
  //     const newScale = normalizedCountScale.copy().domain([normalizedCountScale.domain()[1], normalizedCountScale.domain()[0]]);
  //     return newScale.ticks(5).map((value) => ({
  //       value,
  //       offset: newScale(value),
  //     }));
  //   }
  //   return normalizedCountScale.ticks(5).map((value) => ({
  //     value,
  //     offset: normalizedCountScale(value),
  //   }));
  // }, [config.direction, normalizedCountScale]);

  // const numericalValueTicks = useMemo(() => {
  //   const mappedTicks = numericalValueScale?.ticks(5)?.map((value) => ({
  //     value,
  //     offset: numericalValueScale?.(value),
  //   }));
  //   return mappedTicks?.length === 4
  //     ? [...mappedTicks, { value: numericalValueScale?.domain()[1], offset: numericalValueScale?.(numericalValueScale?.domain()[1]) }]
  //     : mappedTicks;
  // }, [numericalValueScale]);

  // TODO: @dv-usama-ansari: Ask @dvdanielamoitzi about this.
  const sortTypeCallback = useCallback(
    (label: string, nextSortState: ESortStates) => {
      if (label && config.catColumnSelected?.name) {
        if (label === config.catColumnSelected?.name) {
          if (nextSortState === ESortStates.ASC) {
            setSortType(SortTypes.CAT_ASC);
          } else if (nextSortState === ESortStates.DESC) {
            setSortType(SortTypes.CAT_DESC);
          } else {
            setSortType(SortTypes.NONE);
          }
        } else if (nextSortState === ESortStates.ASC) {
          setSortType(SortTypes.COUNT_ASC);
        } else if (nextSortState === ESortStates.DESC) {
          setSortType(SortTypes.COUNT_DESC);
        } else {
          setSortType(SortTypes.NONE);
        }
      } else if (label && config.numColumnSelected?.name) {
        if (label === config.numColumnSelected?.name) {
          if (nextSortState === ESortStates.ASC) {
            setSortType(SortTypes.NUM_ASC);
          } else if (nextSortState === ESortStates.DESC) {
            setSortType(SortTypes.NUM_DESC);
          } else {
            setSortType(SortTypes.NONE);
          }
        } else if (nextSortState === ESortStates.ASC) {
          setSortType(SortTypes.ID_ASC);
        } else if (nextSortState === ESortStates.DESC) {
          setSortType(SortTypes.ID_DESC);
        } else {
          setSortType(SortTypes.NONE);
        }
      } else {
        setSortType(SortTypes.NONE);
      }
    },
    [config.catColumnSelected?.name, config.numColumnSelected?.name, setSortType],
  );

  // NOTE: @dv-usama-ansari: Experimental section starts

  const {
    categoryCountScale: experimentalCategoryCountScale,
    categoryValueScale: experimentalCategoryValueScale,
    numericalIdScale: experimentalNumericalIdScale,
    numericalValueScale: experimentalNumericalValueScale,
  } = useExperimentalGetGroupedBarScales({
    config,
    experimentalBarDataColumns,
    selectedMap,
    sortType,
    height,
    width,
    margin: getMargin(shouldRotateXAxisTicks),
  });

  const experimentalAggregatedData = useMemo(() => {
    return experimentalGroupByAggregateType({ aggregateType: config.aggregateType, experimentalBarDataColumns, selectedMap });
  }, [config.aggregateType, experimentalBarDataColumns, selectedMap]);

  const experimentalCategoryValueTicks = useMemo(() => {
    return experimentalCategoryValueScale?.domain().map((value) => ({
      value,
      offset: experimentalCategoryValueScale(value) + experimentalCategoryValueScale.bandwidth() / 2,
    }));
  }, [experimentalCategoryValueScale]);

  const experimentalNumericalIdTicks = useMemo(() => {
    const domain = experimentalNumericalIdScale?.domain();
    if (experimentalNumericalIdScale?.bandwidth() <= 10) {
      return domain?.reduce((acc, value, index) => {
        if (index % 3 === 0) {
          acc.push({
            value,
            offset: experimentalNumericalIdScale(value) + experimentalNumericalIdScale.bandwidth() / 2,
          });
        }
        return acc;
      }, []);
    }
    return domain?.map((value) => ({
      value,
      offset: experimentalNumericalIdScale(value) + experimentalNumericalIdScale.bandwidth() / 2,
    }));
  }, [experimentalNumericalIdScale]);

  const experimentalCategoryCountTicks = useMemo(() => {
    const experimentalNormalizedCountScale =
      config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
        ? experimentalCategoryCountScale.copy().domain([0, 1])
        : experimentalCategoryCountScale;

    if (!experimentalNormalizedCountScale) {
      return null;
    }

    if (config.direction !== EBarDirection.VERTICAL) {
      const newScale = experimentalNormalizedCountScale
        .copy()
        .domain([experimentalNormalizedCountScale.domain()[0], experimentalNormalizedCountScale.domain()[1]]);
      return newScale.ticks(5).map((value) => ({
        value,
        offset: newScale(value),
      }));
    }

    return experimentalNormalizedCountScale.ticks(5).map((value) => ({
      value,
      offset: experimentalNormalizedCountScale(value),
    }));
  }, [config.direction, config.display, config.group, config.groupType, experimentalCategoryCountScale]);

  const experimentalNumericalValueTicks = useMemo(() => {
    const mappedTicks = experimentalNumericalValueScale?.ticks(5)?.map((value) => ({
      value,
      offset: experimentalNumericalValueScale?.(value),
    }));
    return mappedTicks?.length === 4
      ? [
          ...mappedTicks,
          { value: experimentalNumericalValueScale?.domain()[1], offset: experimentalNumericalValueScale?.(experimentalNumericalValueScale?.domain()[1]) },
        ]
      : mappedTicks;
  }, [experimentalNumericalValueScale]);

  // NOTE: @dv-usama-ansari: Experimental section ends

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
            {experimentalCategoryCountScale && experimentalCategoryValueScale ? (
              <text
                dominantBaseline="middle"
                style={{ fontWeight: 500, fill: '#505459' }}
                textAnchor="middle"
                transform={`translate(${
                  config.direction === EBarDirection.VERTICAL
                    ? (experimentalCategoryValueScale.range()[0] + experimentalCategoryValueScale.range()[1]) / 2
                    : (experimentalCategoryCountScale.range()[0] + experimentalCategoryCountScale.range()[1]) / 2
                }, ${getMargin(shouldRotateXAxisTicks).top - 20})`}
              >
                {title}
              </text>
            ) : null}
            <rect
              fill="transparent"
              height={height - getMargin(shouldRotateXAxisTicks).top - getMargin(shouldRotateXAxisTicks).bottom}
              onClick={(e) => selectionCallback(e, [])}
              width={width - getMargin(shouldRotateXAxisTicks).left - getMargin(shouldRotateXAxisTicks).right}
              x={getMargin(shouldRotateXAxisTicks).left}
              y={getMargin(shouldRotateXAxisTicks).top}
            />

            {config.direction === EBarDirection.VERTICAL ? (
              experimentalCategoryCountScale && experimentalCategoryValueScale ? (
                <>
                  <YAxis
                    compact={isSmall}
                    horizontalPosition={getMargin(shouldRotateXAxisTicks).left}
                    label={
                      config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                        ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                        : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                    }
                    setSortType={sortTypeCallback}
                    showLines
                    sortedAsc={sortType === SortTypes.COUNT_ASC}
                    sortedDesc={sortType === SortTypes.COUNT_DESC}
                    // ticks={categoryCountTicks}
                    // xRange={[categoryValueScale.range()[1], categoryValueScale.range()[0]]}
                    // yScale={categoryCountScale}
                    ticks={experimentalCategoryCountTicks}
                    xRange={[experimentalCategoryCountScale.range()[1], experimentalCategoryCountScale.range()[0]]}
                    yScale={experimentalCategoryCountScale}
                    isVertical
                  />
                  <XAxis
                    compact={isSmall}
                    label={config.catColumnSelected?.name}
                    setSortType={sortTypeCallback}
                    shouldRotate={shouldRotateXAxisTicks}
                    showLines
                    sortedAsc={sortType === SortTypes.CAT_ASC}
                    sortedDesc={sortType === SortTypes.CAT_DESC}
                    // ticks={categoryValueTicks}
                    // vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    // xScale={categoryValueScale}
                    // yRange={[categoryCountScale.range()[0], categoryCountScale.range()[1]]}
                    ticks={experimentalCategoryValueTicks}
                    vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    xScale={experimentalCategoryValueScale}
                    yRange={[experimentalCategoryCountScale.range()[0], experimentalCategoryCountScale.range()[1]]}
                    isVertical
                  />
                </>
              ) : experimentalNumericalValueScale && experimentalNumericalIdScale ? (
                <>
                  <YAxis
                    compact={isSmall}
                    horizontalPosition={getMargin(shouldRotateXAxisTicks).left}
                    label={
                      config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                        ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                        : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                    }
                    setSortType={sortTypeCallback}
                    showLines
                    sortedAsc={sortType === SortTypes.COUNT_ASC}
                    sortedDesc={sortType === SortTypes.COUNT_DESC}
                    // ticks={numericalValueTicks}
                    // xRange={[numericalIdScale.range()[0], numericalIdScale.range()[1]]}
                    // yScale={numericalValueScale}
                    ticks={experimentalNumericalValueTicks}
                    xRange={[experimentalNumericalIdScale.range()[0], experimentalNumericalIdScale.range()[1]]}
                    yScale={experimentalNumericalValueScale}
                    isVertical
                  />
                  <XAxis
                    compact={isSmall}
                    label={config.catColumnSelected?.name}
                    setSortType={sortTypeCallback}
                    shouldRotate={shouldRotateXAxisTicks}
                    showLines
                    sortedAsc={sortType === SortTypes.CAT_ASC}
                    sortedDesc={sortType === SortTypes.CAT_DESC}
                    // ticks={numericalIdTicks}
                    // vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    // xScale={numericalValueScale}
                    // yRange={[numericalIdScale.range()[1], numericalIdScale.range()[0]]}
                    ticks={experimentalNumericalIdTicks}
                    vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    xScale={experimentalNumericalValueScale}
                    yRange={[experimentalNumericalIdScale.range()[1], experimentalNumericalIdScale.range()[0]]}
                    isVertical
                  />
                </>
              ) : null
            ) : config.direction === EBarDirection.HORIZONTAL ? (
              experimentalCategoryCountScale && experimentalCategoryValueScale ? (
                <>
                  <YAxis
                    compact={isSmall}
                    horizontalPosition={getMargin(shouldRotateXAxisTicks).left}
                    label={config.catColumnSelected?.name}
                    setSortType={sortTypeCallback}
                    showLines
                    sortedAsc={sortType === SortTypes.CAT_ASC}
                    sortedDesc={sortType === SortTypes.CAT_DESC}
                    // ticks={categoryValueTicks}
                    // xRange={[categoryCountScale.range()[1], categoryCountScale.range()[0]]}
                    // yScale={categoryValueScale}
                    ticks={experimentalCategoryValueTicks}
                    xRange={[experimentalCategoryCountScale.range()[0], experimentalCategoryCountScale.range()[1]]}
                    yScale={experimentalCategoryValueScale}
                  />
                  <XAxis
                    compact={isSmall}
                    label={
                      config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                        ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                        : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                    }
                    setSortType={sortTypeCallback}
                    shouldRotate={shouldRotateXAxisTicks}
                    showLines
                    sortedAsc={sortType === SortTypes.COUNT_ASC}
                    sortedDesc={sortType === SortTypes.COUNT_DESC}
                    // ticks={categoryCountTicks}
                    // vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    // xScale={categoryCountScale}
                    // yRange={[categoryValueScale.range()[0], categoryValueScale.range()[1]]}
                    ticks={experimentalCategoryCountTicks}
                    vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    xScale={experimentalCategoryCountScale}
                    yRange={[experimentalCategoryValueScale.range()[0], experimentalCategoryValueScale.range()[1]]}
                  />
                </>
              ) : experimentalNumericalValueScale && experimentalNumericalIdScale ? (
                <>
                  <YAxis
                    compact={isSmall}
                    horizontalPosition={getMargin(shouldRotateXAxisTicks).left}
                    label={config.catColumnSelected?.name}
                    setSortType={sortTypeCallback}
                    showLines
                    sortedAsc={sortType === SortTypes.CAT_ASC}
                    sortedDesc={sortType === SortTypes.CAT_DESC}
                    // ticks={numericalIdTicks}
                    // xRange={[numericalValueScale.range()[0], numericalValueScale.range()[1]]}
                    // yScale={numericalIdScale}
                    ticks={experimentalNumericalIdTicks}
                    xRange={[experimentalNumericalValueScale.range()[0], experimentalNumericalValueScale.range()[1]]}
                    yScale={experimentalNumericalIdScale}
                  />
                  <XAxis
                    compact={isSmall}
                    label={
                      config.display === EBarDisplayType.NORMALIZED && config.groupType === EBarGroupingType.STACK && config.group
                        ? `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''} %`
                        : `${config.aggregateType} ${config.aggregateType !== EAggregateTypes.COUNT ? config?.aggregateColumn?.name || '' : ''}`
                    }
                    setSortType={sortTypeCallback}
                    shouldRotate={shouldRotateXAxisTicks}
                    showLines
                    sortedAsc={sortType === SortTypes.COUNT_ASC}
                    sortedDesc={sortType === SortTypes.COUNT_DESC}
                    // ticks={numericalValueTicks}
                    // vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    // xScale={numericalValueScale}
                    // yRange={[numericalIdScale.range()[1], numericalIdScale.range()[0]]}
                    ticks={experimentalNumericalValueTicks}
                    vertPosition={height - getMargin(shouldRotateXAxisTicks).bottom}
                    xScale={experimentalNumericalValueScale}
                    yRange={[experimentalNumericalIdScale.range()[1], experimentalNumericalIdScale.range()[0]]}
                  />
                </>
              ) : null
            ) : null}

            {config.group ? (
              config.groupType === EBarGroupingType.GROUP ? (
                <GroupedBars
                  aggregateColumnName={config.aggregateColumn?.name}
                  aggregateType={config.aggregateType}
                  categoryName={config.catColumnSelected?.name}
                  // categoryScale={categoryValueScale}
                  // countScale={categoryCountScale}
                  categoryScale={experimentalCategoryValueScale}
                  countScale={experimentalCategoryCountScale}
                  groupColorScale={groupColorScale}
                  groupedData={experimentalAggregatedData}
                  groupedTable={groupedTable}
                  groupName={config.group.name}
                  groupScale={groupScale}
                  hasSelected={selectedList.length > 0}
                  height={height}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                  margin={getMargin(shouldRotateXAxisTicks)}
                  selectionCallback={selectionCallback}
                  width={width}
                />
              ) : (
                <StackedBars
                  aggregateColumnName={config.aggregateColumn?.name}
                  aggregateType={config.aggregateType}
                  categoryName={config.catColumnSelected?.name}
                  // categoryScale={categoryValueScale}
                  // countScale={categoryCountScale}
                  categoryScale={experimentalCategoryValueScale}
                  countScale={experimentalCategoryCountScale}
                  groupColorScale={groupColorScale}
                  groupedTable={groupedTable}
                  groupName={config.group.name}
                  hasSelected={selectedList.length > 0}
                  height={height}
                  isVertical={config.direction === EBarDirection.VERTICAL}
                  margin={getMargin(shouldRotateXAxisTicks)}
                  normalized={config.display === EBarDisplayType.NORMALIZED}
                  selectionCallback={selectionCallback}
                  width={width}
                />
              )
            ) : (
              <SimpleBars
                aggregateColumnName={config.aggregateColumn?.name}
                experimentalAggregatedData={experimentalAggregatedData}
                aggregatedTable={aggregatedTable}
                aggregateType={config.aggregateType}
                categoryName={config.catColumnSelected?.name}
                numericalName={config.numColumnSelected?.name}
                // categoryValueScale={categoryValueScale}
                // categoryCountScale={categoryCountScale}
                categoryValueScale={experimentalCategoryValueScale}
                categoryCountScale={experimentalCategoryCountScale}
                hasSelected={selectedList.length > 0}
                height={height}
                isVertical={config.direction === EBarDirection.VERTICAL}
                margin={getMargin(shouldRotateXAxisTicks)}
                // numericalIdScale={numericalIdScale}
                // numericalValueScale={numericalValueScale}
                numericalIdScale={experimentalNumericalIdScale}
                numericalValueScale={experimentalNumericalValueScale}
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
