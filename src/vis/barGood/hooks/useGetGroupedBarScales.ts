/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { op, table, bin } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { useGetBarScales } from './useGetBarScales';
import { getBarData } from '../utils';
import { EBarGroupingType, EColumnTypes } from '../../interfaces';

export function useGetGroupedBarScales(
  allColumns: Awaited<ReturnType<typeof getBarData>>,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
  categoryFilter: string | null,
  isVertical: boolean,
  selectedMap: Record<string, boolean>,
  groupType: EBarGroupingType,
): {
  aggregatedTable: ColumnTable;
  countScale: d3.ScaleLinear<number, number>;
  categoryScale: d3.ScaleBand<string>;
  groupedTable: ColumnTable;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  groupScale: d3.ScaleBand<string>;
} {
  const { aggregatedTable, categoryScale, countScale } = useGetBarScales(allColumns, height, width, margin, categoryFilter, isVertical, selectedMap);

  const groupedTable = useMemo(() => {
    if (allColumns?.groupColVals) {
      let myTable = table({
        category: allColumns.catColVals.resolvedValues.map((val) => val.val),
        group: allColumns.groupColVals.resolvedValues.map((val) => val.val),
        multiples: allColumns?.multiplesColVals?.resolvedValues.map((val) => val.val) || [],
        selected: allColumns.catColVals.resolvedValues.map((val) => (selectedMap[val.id] ? 1 : 0)),
        id: allColumns.catColVals.resolvedValues.map((val) => val.id),
      });

      if (categoryFilter && allColumns?.multiplesColVals) {
        myTable = myTable.params({ categoryFilter }).filter((d) => d.multiples === categoryFilter);
      }

      const grouped = myTable
        .groupby('category', 'group')
        .rollup({ count: () => op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('category')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });

      const binnedTable = myTable
        .groupby('category', { group: bin('group', { maxbins: 9 }), group_max: bin('group', { maxbins: 9, offset: 1 }) })
        .rollup({ count: () => op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('group')
        .groupby('category')
        .derive({ categoryCount: (d) => op.sum(d.count) });

      return allColumns.groupColVals.type === EColumnTypes.NUMERICAL ? binnedTable : grouped;
    }

    return null;
  }, [allColumns, categoryFilter, selectedMap]);

  const groupColorScale = useMemo(() => {
    if (!groupedTable) return null;

    const newGroup = groupedTable.ungroup().groupby('group').count();

    return d3
      .scaleOrdinal<string>()
      .domain(newGroup.array('group').sort())
      .range(
        allColumns.groupColVals.type === EColumnTypes.NUMERICAL
          ? d3.schemeBlues[newGroup.array('group').length]
          : ['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b'],
      );
  }, [groupedTable, allColumns]);

  const groupScale = useMemo(() => {
    if (!groupedTable) return null;
    const newGroup = groupedTable.ungroup().groupby('category', 'group').count();

    return d3.scaleBand().range([0, categoryScale.bandwidth()]).domain(newGroup.array('group').sort()).padding(0.1);
  }, [categoryScale, groupedTable]);

  const newCountScale = useMemo(() => {
    if (!groupedTable || groupType === EBarGroupingType.STACK) {
      return countScale;
    }

    const tempScale = countScale.copy().domain([0, +d3.max(groupedTable.array('count')) + +d3.max(groupedTable.array('count')) / 25]);

    return tempScale;
  }, [countScale, groupType, groupedTable]);

  return {
    aggregatedTable,
    countScale: newCountScale,
    categoryScale,
    groupColorScale,
    groupScale,
    groupedTable,
  };
}
