import React, { useMemo } from 'react';

import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';

import { Stack, Text } from '@mantine/core';
import { SingleBar } from '../barComponents/SingleBar';
import { EAggregateTypes } from '../../interfaces';

export function SimpleBars({
  aggregateColumnName = null,
  aggregatedTable,
  aggregateType,
  categoryName,
  categoryValueScale,
  categoryCountScale,
  hasSelected = false,
  height,
  isVertical = true,
  margin,
  numericalName,
  numericalValueScale,
  numericalIdScale,
  selectionCallback,
  width,
}: {
  aggregateColumnName?: string;
  aggregatedTable: ColumnTable;
  aggregateType: EAggregateTypes;
  categoryName: string;
  categoryValueScale: d3.ScaleBand<string>;
  categoryCountScale: d3.ScaleLinear<number, number>;
  hasSelected?: boolean;
  height: number;
  isVertical?: boolean;
  margin: { top: number; bottom: number; left: number; right: number };
  numericalName?: string;
  numericalValueScale: d3.ScaleLinear<number, number>;
  numericalIdScale: d3.ScaleBand<string>;
  selectionCallback: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  width: number;
}) {
  const bars = useMemo(() => {
    if (aggregatedTable && width !== 0 && height !== 0) {
      const aggregatedTableObjects = aggregatedTable.objects();
      if (categoryValueScale && categoryCountScale) {
        return aggregatedTableObjects
          .slice(0, 20)
          .map((row: { category: string; count: number; aggregateVal: number; selectedCount: number; ids: string[] }, index) => {
            const w = isVertical ? categoryValueScale.bandwidth() ?? 10 : width - margin.right - categoryCountScale(row.aggregateVal);
            const h = isVertical ? height - margin.bottom - categoryCountScale(row.aggregateVal) : categoryValueScale.bandwidth();
            const x = isVertical ? categoryValueScale(row.category) ?? 10 * index : margin.left;
            const y = isVertical ? categoryCountScale(row.aggregateVal) : categoryValueScale(row.category) ?? 10 * index;
            const selectedPercent = hasSelected ? row.selectedCount / row.count : null;
            return (
              <SingleBar
                isVertical={isVertical}
                key={row.category}
                onClick={(e) => selectionCallback(e, row.ids)}
                selectedPercent={selectedPercent}
                tooltip={
                  <Stack gap={0}>
                    <Text>{`${categoryName}: ${row.category}`}</Text>
                    <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregateVal}`}</Text>
                  </Stack>
                }
                width={w}
                height={h}
                x={x}
                y={y}
              />
            );
          });
      }
      if (numericalValueScale && numericalIdScale) {
        return aggregatedTableObjects.slice(0, 100).map((row: { numerical: number; selected: number; id: string }, index) => {
          const w = isVertical ? numericalIdScale.bandwidth() ?? 10 : Math.max(width - margin.right - numericalValueScale(row.numerical), 2);
          const h = isVertical ? Math.max(height - margin.bottom - numericalValueScale(row.numerical), 2) : numericalIdScale.bandwidth();
          const x = isVertical ? numericalIdScale(row.id) ?? 10 * index : margin.left;
          const y = isVertical ? numericalValueScale(row.numerical) : numericalIdScale(row.id) ?? 10 * index;
          const selectedPercent = !hasSelected || row.selected ? 1 : 0;
          return (
            <SingleBar
              isVertical={isVertical}
              key={row.id}
              onClick={(e) => selectionCallback(e, [row.id])}
              selectedPercent={selectedPercent}
              tooltip={
                <Stack gap={0}>
                  <Text>{`ID: ${row.id}`}</Text>
                  <Text>{`${numericalName}: ${row.numerical}`}</Text>
                </Stack>
              }
              width={w}
              height={h}
              x={x}
              y={y}
            />
          );
        });
      }
      return null;
    }

    return null;
  }, [
    aggregatedTable,
    width,
    height,
    categoryValueScale,
    categoryCountScale,
    numericalValueScale,
    isVertical,
    margin,
    hasSelected,
    categoryName,
    aggregateType,
    aggregateColumnName,
    selectionCallback,
    numericalIdScale,
    numericalName,
  ]);

  return <g>{bars}</g>;
}
