import React, { useMemo } from 'react';

import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { SingleBar } from './SingleBar';

export function SimpleBars({
  aggregatedTable,
  categoryScale,
  countScale,
  height,
  margin,
}: {
  aggregatedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  countScale: d3.ScaleLinear<number, number>;
  height: number;
  margin: { top: number; bottom: number; left: number; right: number };
}) {
  const bars = useMemo(() => {
    if (aggregatedTable && categoryScale && countScale) {
      return aggregatedTable.objects().map((row: { category: string; count: number }) => {
        return (
          <SingleBar
            key={row.category}
            x={categoryScale(row.category)}
            width={categoryScale.bandwidth()}
            y={countScale(row.count)}
            value={row.count}
            height={height - margin.bottom - countScale(row.count)}
          />
        );
      });
    }

    return null;
  }, [aggregatedTable, categoryScale, countScale, height, margin.bottom]);

  return <g>{bars}</g>;
}
