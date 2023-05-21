import React, { useMemo } from 'react';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { SingleBar } from './SingleBar';

export function GroupedBars({
  groupedTable,
  categoryScale,
  countScale,
  height,
  margin,
  groupScale,
  groupColorScale,
}: {
  groupedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  countScale: d3.ScaleLinear<number, number>;
  groupScale: d3.ScaleBand<string>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  height: number;
  margin: { top: number; bottom: number; left: number; right: number };
}) {
  const bars = useMemo(() => {
    if (groupedTable) {
      return groupedTable
        .groupby('category')
        .objects()
        .map((row: { category: string; group: string; count: number }) => {
          return (
            <SingleBar
              key={row.category + row.group}
              x={categoryScale(row.category) + groupScale(row.group)}
              width={groupScale.bandwidth()}
              y={countScale(row.count)}
              value={row.count}
              height={height - margin.bottom - countScale(row.count)}
              color={groupColorScale(row.group)}
            />
          );
        });
    }
    return null;
  }, [categoryScale, countScale, groupColorScale, groupScale, groupedTable, height, margin.bottom]);

  return <g>{bars}</g>;
}
