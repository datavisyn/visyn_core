/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { table } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';

export function useGetBarScales(
  allColumns: any,
  colsStatus: any,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
): { aggregatedTable: ColumnTable; countScale: d3.ScaleLinear<number, number>; categoryScale: d3.ScaleBand<string> } {
  const aggregatedTable = useMemo(() => {
    if (colsStatus === 'success') {
      const myTable = table({ category: allColumns.catColVals.resolvedValues.map((val) => val.val) });

      const grouped = myTable.groupby('category').count().orderby('category');

      return grouped;
    }

    return null;
  }, [allColumns?.catColVals.resolvedValues, colsStatus]);

  const countScale = useMemo(() => {
    if (!aggregatedTable) return null;
    return d3
      .scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, +d3.max(aggregatedTable.array('count'))]);
  }, [aggregatedTable, height, margin.bottom, margin.top]);

  const categoryScale = useMemo(() => {
    if (!aggregatedTable) return null;
    return d3
      .scaleBand()
      .range([width - margin.right, margin.left])
      .domain(aggregatedTable.array('category'))
      .padding(0.2);
  }, [aggregatedTable, margin.left, margin.right, width]);

  return { aggregatedTable, countScale, categoryScale };
}
