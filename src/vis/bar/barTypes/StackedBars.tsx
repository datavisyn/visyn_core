import * as d3 from 'd3v7';
import React, { useMemo } from 'react';

import { Stack, Text } from '@mantine/core';
import { escape } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { getLabelOrUnknown } from '../../general/utils';
import { EAggregateTypes } from '../../interfaces';
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
  aggregateType,
  aggregateColumnName,
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
  selectionCallback: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  hasSelected?: boolean;
  aggregateType: EAggregateTypes;
  aggregateColumnName?: string;
}) {
  const bars = useMemo(() => {
    if (groupedTable && width !== 0 && height !== 0) {
      let heightSoFar = 0;
      let currentCategory = '';

      return groupedTable
        .orderby(
          'category',
          escape((d) => groupColorScale.domain().indexOf(d.group)),
        )
        .objects()
        .map((row: { category: string; group: string; count: number; aggregateVal: number; categoryCount: number; selectedCount: number; ids: string[] }) => {
          if (currentCategory !== row.category) {
            heightSoFar = 0;
            currentCategory = row.category;
          }

          const myHeight = heightSoFar;
          const normalizedCount = normalized ? countScale((countScale.domain()[1] / row.categoryCount) * row.aggregateVal) : countScale(row.aggregateVal);
          if (isVertical) {
            heightSoFar = myHeight + height - margin.bottom - normalizedCount;
          } else {
            heightSoFar = myHeight + width - margin.right - normalizedCount;
          }

          return (
            <SingleBar
              onClick={(e) => selectionCallback(e, row.ids)}
              isVertical={isVertical}
              selectedPercent={hasSelected ? row.selectedCount / row.count : null}
              key={row.category + row.group}
              x={isVertical ? categoryScale(row.category) : margin.left + myHeight}
              width={isVertical ? categoryScale.bandwidth() : width - margin.right - normalizedCount}
              y={isVertical ? normalizedCount - myHeight : categoryScale(row.category)}
              tooltip={
                <Stack gap={0}>
                  <Text>{`${categoryName}: ${getLabelOrUnknown(row.category)}`}</Text>
                  <Text>{`${groupName}: ${getLabelOrUnknown(row.group)}`}</Text>
                  <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregateVal}`}</Text>
                </Stack>
              }
              height={isVertical ? height - margin.bottom - normalizedCount : categoryScale.bandwidth()}
              color={groupColorScale(row.group)}
              isGroupedOrStacked
            />
          );
        });
    }
    return null;
  }, [
    aggregateColumnName,
    aggregateType,
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
