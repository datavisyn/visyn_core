/* eslint-disable @typescript-eslint/ban-ts-comment */
import ColumnTable from 'arquero/dist/types/table/column-table';
import { table } from 'arquero';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { useGetBarScales } from './useGetBarScales';

export function useGetGroupedBarScales(
  allColumns: any,
  colsStatus: any,
  height: number,
  width: number,
  margin: { top: number; left: number; bottom: number; right: number },
): {
  aggregatedTable: ColumnTable;
  countScale: d3.ScaleLinear<number, number>;
  categoryScale: d3.ScaleBand<string>;
  groupedTable: ColumnTable;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  groupScale: d3.ScaleBand<string>;
} {
  const { aggregatedTable, categoryScale, countScale } = useGetBarScales(allColumns, colsStatus, height, width, margin);

  const groupedTable = useMemo(() => {
    if (colsStatus === 'success' && allColumns.groupColVals) {
      const myTable = table({
        category: allColumns.catColVals.resolvedValues.map((val) => val.val),
        group: allColumns.groupColVals.resolvedValues.map((val) => val.val),
      });

      const grouped = myTable.groupby('category', 'group').count().orderby('category');

      return grouped;
    }

    return null;
  }, [allColumns, colsStatus]);

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
