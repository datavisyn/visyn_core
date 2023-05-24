/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { op, table } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { getBarData } from '../utils';

export function useGetBarScales(
  allColumns: Awaited<ReturnType<typeof getBarData>>,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
  categoryFilter: string | null,
  isVertical: boolean,
  selectedMap: Record<string, boolean>,
): { aggregatedTable: ColumnTable; countScale: d3.ScaleLinear<number, number>; categoryScale: d3.ScaleBand<string> } {
  const aggregatedTable = useMemo(() => {
    if (allColumns?.catColVals) {
      let myTable = table({
        category: allColumns.catColVals.resolvedValues.map((val) => val.val),
        multiples: allColumns?.multiplesColVals?.resolvedValues.map((val) => val.val) || [],
        selected: allColumns.catColVals.resolvedValues.map((val) => (selectedMap[val.id] ? 1 : 0)),
        id: allColumns.catColVals.resolvedValues.map((val) => val.id),
      });

      if (categoryFilter && allColumns?.multiplesColVals) {
        myTable = myTable.params({ categoryFilter }).filter((d) => d.multiples === categoryFilter);
      }

      const grouped = myTable
        .groupby('category')
        .rollup({ count: (d) => op.count(), selectedCount: (d) => op.sum(d.selected), ids: (d) => op.array_agg(d.id) })
        .orderby('category');

      return grouped;
    }

    return null;
  }, [allColumns, categoryFilter, selectedMap]);

  const countScale = useMemo(() => {
    if (!aggregatedTable) return null;
    return d3
      .scaleLinear()
      .range(isVertical ? [height - margin.bottom, margin.top] : [width - margin.right, margin.left])
      .domain([0, +d3.max(aggregatedTable.array('count')) + +d3.max(aggregatedTable.array('count')) / 25]);
  }, [aggregatedTable, height, isVertical, margin, width]);

  const categoryScale = useMemo(() => {
    if (!aggregatedTable) return null;
    return d3
      .scaleBand()
      .range(isVertical ? [width - margin.right, margin.left] : [height - margin.bottom, margin.top])
      .domain(aggregatedTable.array('category'))
      .padding(0.2);
  }, [aggregatedTable, height, isVertical, margin, width]);

  return { aggregatedTable, countScale, categoryScale };
}
