import React, { useMemo } from 'react';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';
import { SingleBar } from '../barComponents/SingleBar';

export function StackedBars({
  groupedTable,
  categoryScale,
  countScale,
  height,
  margin,
  groupColorScale,
  width,
  normalized = false,
  isVertical,
  selectionCallback,
  hasSelected,
}: {
  groupedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  countScale: d3.ScaleLinear<number, number>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  height: number;
  margin: { top: number; bottom: number; left: number; right: number };
  width: number;
  normalized?: boolean;
  isVertical;
  selectionCallback: (ids: string[]) => void;
  hasSelected?: boolean;
}) {
  const bars = useMemo(() => {
    if (groupedTable) {
      let heightSoFar = 0;
      let currentCategory = '';

      return groupedTable
        .groupby('category')
        .objects()
        .map((row: { category: string; group: string; count: number; categoryCount: number; selectedCount: number; ids: string[] }) => {
          if (currentCategory !== row.category) {
            heightSoFar = 0;
            currentCategory = row.category;
          }

          const myHeight = heightSoFar;
          const normalizedCount = normalized ? countScale((countScale.domain()[1] / row.categoryCount) * row.count) : countScale(row.count);
          if (isVertical) {
            heightSoFar = myHeight + height - margin.bottom - normalizedCount;
          } else {
            heightSoFar = myHeight + width - margin.left - normalizedCount;
          }

          return (
            <SingleBar
              onClick={() => selectionCallback(row.ids)}
              isVertical={isVertical}
              selectedPercent={hasSelected ? row.selectedCount / row.count : null}
              key={row.category + row.group}
              x={isVertical ? categoryScale(row.category) : margin.left + myHeight}
              width={isVertical ? categoryScale.bandwidth() : width - margin.left - normalizedCount}
              y={isVertical ? normalizedCount - myHeight : categoryScale(row.category)}
              value={row.count}
              height={isVertical ? height - margin.bottom - normalizedCount : categoryScale.bandwidth()}
              color={groupColorScale(row.group)}
            />
          );
        });
    }
    return null;
  }, [
    categoryScale,
    countScale,
    groupColorScale,
    groupedTable,
    hasSelected,
    height,
    isVertical,
    margin.bottom,
    margin.left,
    normalized,
    selectionCallback,
    width,
  ]);

  return <g>{bars}</g>;
}
