import React, { useMemo } from 'react';

import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { Stack, Text } from '@mantine/core';
import { SingleBar } from '../barComponents/SingleBar';
import { EAggregateTypes } from '../../interfaces';

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
  aggregateType,
  aggregateColumnName = null,
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
  aggregateType: EAggregateTypes;
  aggregateColumnName?: string;
}) {
  const bars = useMemo(() => {
    if (aggregatedTable && categoryScale && countScale && width !== 0 && height !== 0) {
      return aggregatedTable.objects().map((row: { category: string; count: number; aggregateVal: number; selectedCount: number; ids: string[] }) => {
        return (
          <SingleBar
            onClick={(e) => selectionCallback(e, row.ids)}
            isVertical={isVertical}
            selectedPercent={hasSelected ? row.selectedCount / row.count : null}
            key={row.category}
            x={isVertical ? categoryScale(row.category) : margin.left}
            width={isVertical ? categoryScale.bandwidth() : width - margin.right - countScale(row.aggregateVal)}
            y={isVertical ? countScale(row.aggregateVal) : categoryScale(row.category)}
            tooltip={
              <Stack spacing={0}>
                <Text>{`${categoryName}: ${row.category}`}</Text>
                <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregateVal}`}</Text>
              </Stack>
            }
            height={isVertical ? height - margin.bottom - countScale(row.aggregateVal) : categoryScale.bandwidth()}
          />
        );
      });
    }

    return null;
  }, [
    aggregatedTable,
    categoryScale,
    countScale,
    width,
    height,
    isVertical,
    hasSelected,
    margin.left,
    margin.right,
    margin.bottom,
    categoryName,
    aggregateType,
    aggregateColumnName,
    selectionCallback,
  ]);

  return <g>{bars}</g>;
}
