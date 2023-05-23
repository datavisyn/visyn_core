import React, { useMemo } from 'react';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { SingleBar } from '../barComponents/SingleBar';

export function GroupedBars({
  groupedTable,
  categoryScale,
  countScale,
  height,
  margin,
  width,
  groupScale,
  groupColorScale,
  isVertical = true,
  hasSelected = false,
  selectionCallback,
}: {
  groupedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  countScale: d3.ScaleLinear<number, number>;
  groupScale: d3.ScaleBand<string>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  height: number;
  width: number;
  margin: { top: number; bottom: number; left: number; right: number };
  isVertical?: boolean;
  selectionCallback: (ids: string[]) => void;
  hasSelected?: boolean;
}) {
  const bars = useMemo(() => {
    if (groupedTable) {
      return groupedTable
        .groupby('category')
        .objects()
        .map((row: { category: string; group: string; count: number; selectedCount: number; ids: string[] }) => {
          return (
            <SingleBar
              onClick={() => selectionCallback(row.ids)}
              isVertical={isVertical}
              selectedPercent={hasSelected ? row.selectedCount / row.count : null}
              key={row.category + row.group}
              x={isVertical ? categoryScale(row.category) + groupScale(row.group) : margin.left}
              width={isVertical ? groupScale.bandwidth() : width - margin.left - countScale(row.count)}
              y={isVertical ? countScale(row.count) : categoryScale(row.category) + groupScale(row.group)}
              value={row.count}
              height={isVertical ? height - margin.bottom - countScale(row.count) : groupScale.bandwidth()}
              color={groupColorScale(row.group)}
            />
          );
        });
    }
    return null;
  }, [
    groupedTable,
    isVertical,
    hasSelected,
    categoryScale,
    groupScale,
    margin.left,
    margin.bottom,
    width,
    countScale,
    height,
    groupColorScale,
    selectionCallback,
  ]);

  return <g>{bars}</g>;
}
