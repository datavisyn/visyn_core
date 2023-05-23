/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { op, table } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { useGetBarScales } from './useGetBarScales';
import { getBarData } from '../utils';

export function useGetGroupedBarScales(
  allColumns: Awaited<ReturnType<typeof getBarData>>,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
  categoryFilter: string | null,
  isVertical: boolean,
  selectedMap: Record<string, boolean>,
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

      return grouped;
    }

    return null;
  }, [allColumns, categoryFilter, selectedMap]);

  const groupColorScale = useMemo(() => {
    if (!groupedTable) return null;

    const newGroup = groupedTable.ungroup().groupby('group').count();

    return d3.scaleOrdinal<string>().domain(newGroup.array('group')).range(d3.schemeCategory10);
  }, [groupedTable]);

  const groupScale = useMemo(() => {
    if (!groupedTable) return null;
    const newGroup = groupedTable.ungroup().groupby('category', 'group').count();

    return d3.scaleBand().range([0, categoryScale.bandwidth()]).domain(newGroup.array('group')).padding(0.1);
  }, [categoryScale, groupedTable]);

  return { aggregatedTable, countScale, categoryScale, groupColorScale, groupScale, groupedTable };
}
