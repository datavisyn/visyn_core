import { Stack, Text } from '@mantine/core';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import React, { useCallback, useMemo } from 'react';
import { EAggregateTypes } from '../../interfaces';
import { SingleBar } from '../barComponents/SingleBar';

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
  const numericalBarBounds = useCallback(
    (row: { numerical: number; selected: number; id: string }) => {
      const zero = numericalValueScale(0);
      const value = numericalValueScale(row.numerical);
      const id = numericalIdScale(row.id);
      const bandwidth = numericalIdScale.bandwidth() ?? 10;
      let [w, h, x, y] = [0, 0, 0, 0];
      if (row.numerical < 0) {
        if (isVertical) {
          w = bandwidth;
          h = Math.max(Math.abs(value - zero), 2);
          x = id;
          y = zero;
        } else {
          w = Math.max(Math.abs(value - zero), 2);
          h = bandwidth;
          x = value;
          y = id;
        }
      } else if (isVertical) {
        w = bandwidth;
        h = Math.max(Math.abs(value - zero), 2);
        x = id;
        y = value;
      } else {
        w = Math.max(Math.abs(value - zero), 2);
        h = bandwidth;
        x = zero;
        y = id;
      }
      return { w, h, x, y };
    },
    [numericalValueScale, numericalIdScale, isVertical],
  );

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
          const { w, h, x, y } = numericalBarBounds(row);
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
    numericalIdScale,
    isVertical,
    margin.right,
    margin.bottom,
    margin.left,
    hasSelected,
    categoryName,
    aggregateType,
    aggregateColumnName,
    selectionCallback,
    numericalBarBounds,
    numericalName,
  ]);

  return <g>{bars}</g>;
}
