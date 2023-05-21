import React, { useMemo } from 'react';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { SingleBar } from './SingleBar';

export function StackedBars({
  groupedTable,
  categoryScale,
  countScale,
  height,
  margin,
  groupColorScale,
}: {
  groupedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  countScale: d3.ScaleLinear<number, number>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  height: number;
  margin: { top: number; bottom: number; left: number; right: number };
}) {
  const bars = useMemo(() => {
    if (groupedTable) {
      let heightSoFar = 0;
      let currentCategory = '';
      return groupedTable.objects().map((row: { category: string; group: string; count: number }) => {
        if (currentCategory !== row.category) {
          heightSoFar = 0;
          currentCategory = row.category;
        }

        const myHeight = heightSoFar;
        heightSoFar = myHeight + height - margin.bottom - countScale(row.count);

        return (
          <SingleBar
            key={row.category + row.group}
            x={categoryScale(row.category)}
            width={categoryScale.bandwidth()}
            y={countScale(row.count) - myHeight}
            value={row.count}
            height={height - margin.bottom - countScale(row.count)}
            color={groupColorScale(row.group)}
          />
        );
      });
    }
    return null;
  }, [categoryScale, countScale, groupColorScale, groupedTable, height, margin.bottom]);

  return <g>{bars}</g>;
}
