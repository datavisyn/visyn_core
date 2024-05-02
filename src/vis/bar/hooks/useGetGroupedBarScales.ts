/* eslint-disable @typescript-eslint/ban-ts-comment */
import { escape, op } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import { useMemo } from 'react';
import { EAggregateTypes, EColumnTypes } from '../../interfaces';
import { binByAggregateType, getBarData, groupByAggregateType, rollupByAggregateType } from '../utils';
import { EBarGroupingType, SortTypes } from '../interfaces';
import { useGetBarScales } from './useGetBarScales';
import { categoricalColors as colorScale } from '../../../utils/colors';

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
  const { aggregatedTable, baseTable, categoryValueScale, categoryCountScale, numericalValueScale, numericalIdScale } = useGetBarScales({
    allColumns,
    height,
    width,
    margin,
    categoryFilter,
    isVertical,
    selectedMap,
    sortType,
    aggregateType,
  });

  const groupedTable = useMemo(() => {
    if (!allColumns) return null;

    if (allColumns.groupColVals) {
      let filteredTable = baseTable;

      if (categoryFilter && allColumns.multiplesColVals) {
        filteredTable = baseTable.filter(escape((d) => d.multiples === categoryFilter));
      }
      return allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? binByAggregateType(filteredTable, aggregateType)
        : groupByAggregateType(filteredTable, aggregateType);
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

    // No multiples, only group
    if (!allColumns.multiplesColVals) {
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

    // Multiples only, or multiples and stacked.
    if (!groupedTable || (groupType === EBarGroupingType.STACK && aggregateType === EAggregateTypes.COUNT)) {
      const max = +d3.max(rollupByAggregateType(baseTable.groupby('category', 'multiples'), aggregateType).array('aggregateVal'));
      return categoryCountScale.copy().domain([0, max + max / 25]);
    }

    // Multiples + stacking with something other than count. Tricky one. Change max
    if (groupType === EBarGroupingType.STACK) {
      const max = +d3.max(
        rollupByAggregateType(baseTable.groupby('category', 'group', 'multiples'), aggregateType)
          .groupby('category', 'multiples')
          .rollup({ sum: (d) => op.sum(d.aggregateVal) })
          .array('sum'),
      );
      return categoryCountScale.copy().domain([0, max + max / 25]);
    }

    // Multiples + grouped but not stacked. Change max.
    const max = +d3.max(rollupByAggregateType(baseTable.groupby('group', 'category', 'multiples'), aggregateType).array('aggregateVal'));

    const tempScale = categoryCountScale.copy().domain([0, max + max / 25]);

    return tempScale;
  }, [aggregateType, allColumns, baseTable, categoryCountScale, groupType, groupedTable]);

  return {
    aggregatedTable,
    categoryValueScale,
    categoryCountScale: newCountScale,
    groupColorScale,
    groupedTable,
    groupScale,
    numericalValueScale,
    numericalIdScale,
  };
}
