import React, { useMemo } from 'react';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { Stack, Text } from '@mantine/core';
import { SingleBar } from '../barComponents/SingleBar';
import { EAggregateTypes } from '../../interfaces';

export function GroupedBars({
  groupedTable,
  categoryScale,
  countScale,
  categoryName,
  groupName,
  height,
  margin,
  width,
  groupScale,
  groupColorScale,
  isVertical = true,
  hasSelected = false,
  selectionCallback,
  aggregateType,
  aggregateColumnName = null,
}: {
  groupedTable: ColumnTable;
  categoryScale: d3.ScaleBand<string>;
  countScale: d3.ScaleLinear<number, number>;
  categoryName: string;
  groupName: string;
  groupScale: d3.ScaleBand<string>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  height: number;
  width: number;
  margin: { top: number; bottom: number; left: number; right: number };
  isVertical?: boolean;
  selectionCallback: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  hasSelected?: boolean;
  aggregateType?: EAggregateTypes;
  aggregateColumnName?: string;
}) {
  const bars = useMemo(() => {
    if (groupedTable && width !== 0 && height !== 0) {
      return groupedTable
        .orderby('category', 'group')
        .objects()
        .map((row: { category: string; group: string; count: number; aggregateVal: number; selectedCount: number; ids: string[] }) => {
          return (
            <SingleBar
              onClick={(e) => selectionCallback(e, row.ids)}
              isVertical={isVertical}
              selectedPercent={hasSelected ? row.selectedCount / row.count : null}
              key={row.category + row.group}
              x={isVertical ? categoryScale(row.category) + groupScale(row.group) : margin.left}
              width={isVertical ? groupScale.bandwidth() : width - margin.right - countScale(row.aggregateVal)}
              y={isVertical ? countScale(row.aggregateVal) : categoryScale(row.category) + groupScale(row.group)}
              tooltip={
                <Stack gap={0}>
                  <Text>{`${categoryName}: ${row.category}`}</Text>
                  <Text>{`${groupName}: ${row.group}`}</Text>
                  <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregateVal}`}</Text>
                </Stack>
              }
              height={isVertical ? height - margin.bottom - countScale(row.aggregateVal) : groupScale.bandwidth()}
              color={groupColorScale(row.group)}
            />
          );
        });
    }
    return null;
  }, [
    groupedTable,
    width,
    height,
    isVertical,
    hasSelected,
    categoryScale,
    groupScale,
    margin.left,
    margin.right,
    margin.bottom,
    countScale,
    categoryName,
    groupName,
    aggregateType,
    aggregateColumnName,
    groupColorScale,
    selectionCallback,
  ]);

  return <g>{bars}</g>;
}
