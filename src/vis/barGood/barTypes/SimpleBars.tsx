import React, { useMemo } from 'react';

import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { Stack, Text } from '@mantine/core';
import { SingleBar } from '../barComponents/SingleBar';

export function SimpleBars({
  aggregatedTable,
  categoryScale,
  categoryName,
  countScale,
  height,
  width,
  margin,
  isVertical = true,
  selectionCallback,
  hasSelected = false,
}: {
  aggregatedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  categoryName: string;
  countScale: d3.ScaleLinear<number, number>;
  height: number;
  width: number;
  margin: { top: number; bottom: number; left: number; right: number };
  isVertical?: boolean;
  selectionCallback: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  hasSelected?: boolean;
}) {
  const bars = useMemo(() => {
    if (aggregatedTable && categoryScale && countScale && width !== 0 && height !== 0) {
      return aggregatedTable.objects().map((row: { category: string; count: number; selectedCount: number; ids: string[] }) => {
        return (
          <SingleBar
            onClick={(e) => selectionCallback(e, row.ids)}
            isVertical={isVertical}
            selectedPercent={hasSelected ? row.selectedCount / row.count : null}
            key={row.category}
            x={isVertical ? categoryScale(row.category) : margin.left}
            width={isVertical ? categoryScale.bandwidth() : width - margin.right - countScale(row.count)}
            y={isVertical ? countScale(row.count) : categoryScale(row.category)}
            tooltip={
              <Stack spacing={0}>
                <Text>{`${categoryName}: ${row.category}`}</Text>
                <Text>{`Count: ${row.count}`}</Text>
              </Stack>
            }
            height={isVertical ? height - margin.bottom - countScale(row.count) : categoryScale.bandwidth()}
          />
        );
      });
    }

    return null;
  }, [
    aggregatedTable,
    categoryScale,
    countScale,
    isVertical,
    hasSelected,
    margin.left,
    margin.right,
    margin.bottom,
    width,
    categoryName,
    height,
    selectionCallback,
  ]);

  return <g>{bars}</g>;
}
