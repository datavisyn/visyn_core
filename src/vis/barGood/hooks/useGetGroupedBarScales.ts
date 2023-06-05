/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { op, table, bin } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { aggregate } from 'lineupjs';
import { useGetBarScales } from './useGetBarScales';
import { SortTypes, binByAggregateType, getBarData, groupByAggregateType, sortTableBySortType, rollupByAggregateType } from '../utils';
import { EAggregateTypes, EBarGroupingType, EColumnTypes } from '../../interfaces';

export function useGetGroupedBarScales(
  allColumns: Awaited<ReturnType<typeof getBarData>>,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
  categoryFilter: string | null,
  isVertical: boolean,
  selectedMap: Record<string, boolean>,
  groupType: EBarGroupingType,
  sortType: SortTypes,
  aggregateType: EAggregateTypes,
): {
  aggregatedTable: ColumnTable;
  countScale: d3.ScaleLinear<number, number>;
  categoryScale: d3.ScaleBand<string>;
  groupedTable: ColumnTable;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  groupScale: d3.ScaleBand<string>;
} {
  const { aggregatedTable, categoryScale, countScale, baseTable } = useGetBarScales(
    allColumns,
    height,
    width,
    margin,
    categoryFilter,
    isVertical,
    selectedMap,
    sortType,
    aggregateType,
  );

  const groupedTable = useMemo(() => {
    if (allColumns?.groupColVals) {
      let filteredTable = baseTable;

      if (categoryFilter && allColumns?.multiplesColVals) {
        filteredTable = baseTable.params({ categoryFilter }).filter((d) => d.multiples === categoryFilter);
      }

      return allColumns.groupColVals.type === EColumnTypes.NUMERICAL
        ? binByAggregateType(filteredTable, aggregateType)
        : groupByAggregateType(filteredTable, aggregateType);
    }

    return null;
  }, [aggregateType, allColumns?.groupColVals, allColumns?.multiplesColVals, baseTable, categoryFilter]);

  const groupColorScale = useMemo(() => {
    if (!groupedTable) return null;

    const newGroup = groupedTable.ungroup().groupby('group').count();

    return d3
      .scaleOrdinal<string>()
      .domain(newGroup.array('group').sort())
      .range(
        allColumns.groupColVals.type === EColumnTypes.NUMERICAL
          ? d3.schemeBlues[newGroup.array('group').length > 3 ? newGroup.array('group').length : 3]
          : ['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b'],
      );
  }, [groupedTable, allColumns]);

  const groupScale = useMemo(() => {
    if (!groupedTable) return null;
    const newGroup = groupedTable.ungroup().groupby('category', 'group').count();

    return d3.scaleBand().range([0, categoryScale.bandwidth()]).domain(newGroup.array('group').sort()).padding(0.1);
  }, [categoryScale, groupedTable]);

  const newCountScale = useMemo(() => {
    if (!allColumns?.multiplesColVals) {
      if (!groupedTable || (groupType === EBarGroupingType.STACK && aggregateType === EAggregateTypes.COUNT)) {
        return countScale;
      }

      if (groupType === EBarGroupingType.STACK) {
        const max = +d3.max(
          groupedTable
            .groupby('category')
            .rollup({ sum: (d) => op.sum(d.aggregateVal) })
            .array('sum'),
        );
        return countScale.copy().domain([0, max + max / 25]);
      }

      const max = +d3.max(groupedTable.array('aggregateVal'));
      return countScale.copy().domain([0, max + max / 25]);
    }

    if (!groupedTable || groupType === EBarGroupingType.STACK) {
      const max = +d3.max(rollupByAggregateType(baseTable.groupby('category', 'multiples'), aggregateType).array('aggregateVal'));
      return countScale.copy().domain([0, max + max / 25]);
    }

    const max = +d3.max(rollupByAggregateType(baseTable.groupby('group', 'category', 'multiples'), aggregateType).array('aggregateVal'));

    const tempScale = countScale.copy().domain([0, max + max / 25]);

    return tempScale;
  }, [aggregateType, allColumns?.multiplesColVals, baseTable, countScale, groupType, groupedTable]);

  return {
    aggregatedTable,
    countScale: newCountScale,
    categoryScale,
    groupColorScale,
    groupScale,
    groupedTable,
  };
}
