import React, { useMemo } from 'react';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';
import { Stack, Text } from '@mantine/core';
import { SingleBar } from '../barComponents/SingleBar';

export function StackedBars({
  groupedTable,
  categoryScale,
  countScale,
  categoryName,
  groupName,
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
  categoryName: string;
  groupName: string;
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
        .orderby('category', 'group')
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
            heightSoFar = myHeight + width - margin.right - normalizedCount;
          }

          return (
            <SingleBar
              onClick={() => selectionCallback(row.ids)}
              isVertical={isVertical}
              selectedPercent={hasSelected ? row.selectedCount / row.count : null}
              key={row.category + row.group}
              x={isVertical ? categoryScale(row.category) : margin.left + myHeight}
              width={isVertical ? categoryScale.bandwidth() : width - margin.right - normalizedCount}
              y={isVertical ? normalizedCount - myHeight : categoryScale(row.category)}
              tooltip={
                <Stack spacing={0}>
                  <Text>{`${categoryName}: ${row.category}`}</Text>
                  <Text>{`${groupName}: ${row.group}`}</Text>
                  <Text>{`Count: ${row.count}`}</Text>
                </Stack>
              }
              height={isVertical ? height - margin.bottom - normalizedCount : categoryScale.bandwidth()}
              color={groupColorScale(row.group)}
            />
          );
        });
    }
    return null;
  }, [
    categoryName,
    categoryScale,
    countScale,
    groupColorScale,
    groupName,
    groupedTable,
    hasSelected,
    height,
    isVertical,
    margin.bottom,
    margin.left,
    margin.right,
    normalized,
    selectionCallback,
    width,
  ]);

  return <g>{bars}</g>;
}
