/* eslint-disable @typescript-eslint/ban-ts-comment */
import { escape, op } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import { useMemo } from 'react';
import { categoricalColors as colorScale } from '../../../utils/colors';
import { EAggregateTypes, EColumnTypes } from '../../interfaces';
import { EBarDirection, EBarGroupingType, IBarConfig, SortTypes } from '../interfaces';
import {
  binByAggregateType,
  experimentalGetBarData,
  experimentalGroupByAggregateType,
  getBarData,
  groupByAggregateType,
  rollupByAggregateType,
} from '../utils';
import { useExperimentalGetBarScales, useGetBarScales } from './useGetBarScales';

export function useGetGroupedBarScales({
  aggregateType,
  allColumns,
  categoryFilter,
  groupType,
  height,
  isVertical,
  margin,
  selectedMap,
  sortType,
  width,
}: {
  aggregateType: EAggregateTypes;
  allColumns: Awaited<ReturnType<typeof getBarData>>;
  categoryFilter: string | null;
  groupType: EBarGroupingType;
  height: number;
  isVertical: boolean;
  margin: { top: number; left: number; bottom: number; right: number };
  selectedMap: Record<string, boolean>;
  sortType: SortTypes;
  width: number;
}): {
  aggregatedTable: ColumnTable;
  categoryValueScale: d3.ScaleBand<string>;
  categoryCountScale: d3.ScaleLinear<number, number>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  groupedTable: ColumnTable;
  groupScale: d3.ScaleBand<string>;
  numericalValueScale: d3.ScaleLinear<number, number>;
  numericalIdScale: d3.ScaleBand<string>;
} {
  const { aggregatedTable, baseTable, categoryCountScale, categoryValueScale, numericalIdScale, numericalValueScale } = useGetBarScales({
    aggregateType,
    allColumns,
    categoryFilter,
    height,
    isVertical,
    margin,
    selectedMap,
    sortType,
    width,
  });

  const groupedTable = useMemo(() => {
    if (!allColumns) return null;

    if (allColumns.groupColVals) {
      let filteredTable = baseTable;

      if (categoryFilter && allColumns.facetsColVals) {
        filteredTable = baseTable.filter(escape((d) => d.facets === categoryFilter));
      }
      const tableGroupedOnColumnType =
        allColumns.groupColVals.type === EColumnTypes.NUMERICAL
          ? binByAggregateType(filteredTable, aggregateType)
          : groupByAggregateType(filteredTable, aggregateType);
      return tableGroupedOnColumnType;
    }

    return null;
  }, [aggregateType, allColumns, baseTable, categoryFilter]);

  const groupColorScale = useMemo(() => {
    if (!groupedTable) return null;

    let i = -1;

    const newGroup = groupedTable.ungroup().groupby('group').count();
    const categoricalColors = allColumns.groupColVals.color
      ? newGroup
          .array('group')
          .sort()
          .map((value) => {
            i += 1;
            return allColumns.groupColVals.color[value] || colorScale[i % colorScale.length];
          })
      : colorScale;

    const domain = newGroup.array('group').sort();
    const range =
      allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? d3.schemeBlues[newGroup.array('group').length > 3 ? newGroup.array('group').length : 3]
        : categoricalColors;

    return d3.scaleOrdinal<string>().domain(domain).range(range);
  }, [groupedTable, allColumns]);

  const groupScale = useMemo(() => {
    if (!groupedTable) return null;
    const newGroup = groupedTable.ungroup().groupby('category', 'group').count();

    return d3.scaleBand().range([0, categoryValueScale.bandwidth()]).domain(newGroup.array('group').sort()).padding(0.1);
  }, [categoryValueScale, groupedTable]);

  const newCountScale = useMemo(() => {
    if (!allColumns) return null;

    // No facets, only group
    if (!allColumns.facetsColVals) {
      // No group or group is a stack of count, dont need to change scale
      if (!groupedTable || (groupType === EBarGroupingType.STACK && aggregateType === EAggregateTypes.COUNT)) {
        return categoryCountScale;
      }

      // Group is a stack of something other than count, change max.
      if (groupType === EBarGroupingType.STACK) {
        const max = +d3.max(
          groupedTable
            .groupby('category')
            .rollup({ sum: (d) => op.sum(d.aggregateVal) })
            .array('sum'),
        );
        return categoryCountScale.copy().domain([0, max + max / 25]);
      }

      // Group is not stacked, change max.
      const max = +d3.max(groupedTable.array('aggregateVal'));
      return categoryCountScale.copy().domain([0, max + max / 25]);
    }

    // facets only, or facets and stacked.
    if (!groupedTable || (groupType === EBarGroupingType.STACK && aggregateType === EAggregateTypes.COUNT)) {
      const max = +d3.max(rollupByAggregateType(baseTable.groupby('category', 'facets'), aggregateType).array('aggregateVal'));
      return categoryCountScale.copy().domain([0, max + max / 25]);
    }

    // facets + stacking with something other than count. Tricky one. Change max
    if (groupType === EBarGroupingType.STACK) {
      const max = +d3.max(
        rollupByAggregateType(baseTable.groupby('category', 'group', 'facets'), aggregateType)
          .groupby('category', 'facets')
          .rollup({ sum: (d) => op.sum(d.aggregateVal) })
          .array('sum'),
      );
      return categoryCountScale.copy().domain([0, max + max / 25]);
    }

    // facets + grouped but not stacked. Change max.
    const max = +d3.max(rollupByAggregateType(baseTable.groupby('group', 'category', 'facets'), aggregateType).array('aggregateVal'));

    const tempScale = categoryCountScale.copy().domain([0, max + max / 25]);

    return tempScale;
  }, [aggregateType, allColumns, baseTable, categoryCountScale, groupType, groupedTable]);

  return {
    aggregatedTable,
    categoryCountScale: newCountScale,
    categoryValueScale,
    groupColorScale,
    groupedTable,
    groupScale,
    numericalIdScale,
    numericalValueScale,
  };
}

export function useExperimentalGetGroupedBarScales({
  experimentalBarDataColumns,
  config,
  height,
  margin,
  sortType,
  width,
}: {
  config: IBarConfig;
  experimentalBarDataColumns: Awaited<ReturnType<typeof experimentalGetBarData>>;
  height: number;
  margin: { top: number; left: number; bottom: number; right: number };
  sortType: SortTypes;
  width: number;
}) {
  const isVertical = useMemo(() => config.direction === EBarDirection.VERTICAL, [config.direction]);
  const experimentalAggregatedData = useMemo(
    () =>
      experimentalGroupByAggregateType({
        aggregateType: config.aggregateType,
        experimentalBarDataColumns,
        selectedMap: {},
      }),
    [config.aggregateType, experimentalBarDataColumns],
  );

  const { categoryCountScale, categoryValueScale, numericalIdScale, numericalValueScale } = useExperimentalGetBarScales({
    config,
    experimentalBarDataColumns,
    sortType,
    height,
    width,
    margin,
  });

  const groupedColorScale = useMemo(() => {
    const domain = [...new Set(experimentalAggregatedData.map((d) => d.group as string))].sort();
    const categoricalColors = experimentalBarDataColumns?.awaitedGroupColumnValues?.color
      ? domain.map((value, index) => experimentalBarDataColumns?.awaitedGroupColumnValues?.color[value] || colorScale[index % colorScale.length])
      : colorScale;
    const range =
      experimentalBarDataColumns?.awaitedGroupColumnValues?.type === EColumnTypes.NUMERICAL ? d3.schemeBlues[Math.max(domain.length, 3)] : categoricalColors;
    return d3.scaleOrdinal<string>().domain(domain).range(range);
  }, [experimentalAggregatedData, experimentalBarDataColumns?.awaitedGroupColumnValues?.color, experimentalBarDataColumns?.awaitedGroupColumnValues?.type]);

  const groupedScale = useMemo(() => {
    if (!experimentalAggregatedData) return null;
    const domain = [...new Set(experimentalAggregatedData.map((d) => d.group as string))].sort();
    const range = [0, categoryValueScale?.bandwidth()];
    return d3.scaleBand().domain(domain).range(range).padding(0.1);
  }, [categoryValueScale, experimentalAggregatedData]);

  const categoricalCountScaleForGroupAndFacets = useMemo(() => {
    if (!experimentalBarDataColumns) return null;

    // No facets, only group
    if (!experimentalBarDataColumns?.awaitedFacetsColumnValues) {
      // No group or group is a stack of count, dont need to change scale
      if (!experimentalAggregatedData?.length || (config.groupType === EBarGroupingType.STACK && config.aggregateType === EAggregateTypes.COUNT)) {
        return categoryCountScale;
      }

      // Group is a stack of something other than count, change max.
      if (config.groupType === EBarGroupingType.STACK) {
        const max = +d3.max(
          experimentalAggregatedData
            .reduce(
              (acc: { group: number; sum: number }[], d) => ({
                ...acc,
                [d.group]: acc[d.group] ? { group: d.group, sum: acc[d.group].sum + d.aggregatedValue } : { group: d.group, sum: d.aggregatedValue },
              }),
              [],
            )
            .map((d) => d.sum),
        );
        return categoryCountScale?.copy()?.domain([0, max + max / 25]);
      }

      // Group is not stacked, change max.
      const max = +d3.max(experimentalAggregatedData.map((d) => d.aggregatedValue));
      return categoryCountScale?.copy()?.domain([0, max + max / 25]);
    }

    // TODO: @dv-usama-ansari: Rewrite this logic when facets are implemented.
    // facets only, or facets and stacked.
    // if (!groupedTable || (groupType === EBarGroupingType.STACK && aggregateType === EAggregateTypes.COUNT)) {
    //   const max = +d3.max(rollupByAggregateType(baseTable.groupby('category', 'facets'), aggregateType).array('aggregateVal'));
    //   return categoryCountScale.copy().domain([0, max + max / 25]);
    // }

    // // facets + stacking with something other than count. Tricky one. Change max
    // if (groupType === EBarGroupingType.STACK) {
    //   const max = +d3.max(
    //     rollupByAggregateType(baseTable.groupby('category', 'group', 'facets'), aggregateType)
    //       .groupby('category', 'facets')
    //       .rollup({ sum: (d) => op.sum(d.aggregateVal) })
    //       .array('sum'),
    //   );
    //   return categoryCountScale.copy().domain([0, max + max / 25]);
    // }

    // // facets + grouped but not stacked. Change max.
    // const max = +d3.max(rollupByAggregateType(baseTable.groupby('group', 'category', 'facets'), aggregateType).array('aggregateVal'));

    // const max = 0;
    // const tempScale = categoryCountScale.copy().domain([0, max + max / 25]);

    // return tempScale;
    return null;
  }, [categoryCountScale, config.aggregateType, config.groupType, experimentalAggregatedData, experimentalBarDataColumns]);

  return {
    categoryCountScale: categoricalCountScaleForGroupAndFacets,
    categoryValueScale,
    numericalIdScale,
    numericalValueScale,
    groupedColorScale,
    groupedScale,
  };
}
