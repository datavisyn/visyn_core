import { Stack, Text } from '@mantine/core';
import ColumnTable from 'arquero/dist/types/table/column-table';
import * as d3 from 'd3v7';
import React, { useCallback, useMemo } from 'react';
import { EAggregateTypes } from '../../interfaces';
import { SingleBar } from '../barComponents/SingleBar';
import { experimentalGroupByAggregateType } from '../utils';

export function SimpleBars({
  experimentalAggregatedData,
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
  experimentalAggregatedData?: ReturnType<typeof experimentalGroupByAggregateType>;
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
  const categoricalBarBounds = useCallback(
    (row: ReturnType<typeof experimentalGroupByAggregateType>[number]) => {
      const zero = categoryCountScale(0);
      const value = categoryCountScale(row.aggregatedValue);
      const id = categoryValueScale(row.category as string);
      const bandwidth = categoryValueScale.bandwidth() ?? 10;
      let [w, h, x, y] = [0, 0, 0, 0];

      if (isVertical) {
        w = bandwidth;
        h = Math.max(Math.abs(zero - value), 2);
        x = id;
        y = value;
      } else {
        w = Math.max(Math.abs(value - zero), 2);
        h = bandwidth;
        x = zero;
        y = id;
      }

      // NOTE: @dv-usama-ansari: Use circles for debugging
      const circles = { id, value, zero };

      return { w, h, x, y, circles };
    },
    [categoryCountScale, categoryValueScale, isVertical],
  );

  const numericalBarBounds = useCallback(
    (row: ReturnType<typeof experimentalGroupByAggregateType>[number]) => {
      const zero = numericalValueScale(0);
      const value = numericalValueScale(row.aggregatedValue);
      const id = numericalIdScale(row.ids[0]);
      const bandwidth = numericalIdScale.bandwidth() ?? 10;
      let [w, h, x, y] = [0, 0, 0, 0];
      if (row.aggregatedValue < 0) {
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

      // NOTE: @dv-usama-ansari: Use circles for debugging
      const circles = { id, value, zero };

      return { w, h, x, y, circles };
    },
    [numericalValueScale, numericalIdScale, isVertical],
  );

  const bars = useMemo(() => {
    if (experimentalAggregatedData && width !== 0 && height !== 0) {
      if (categoryValueScale && categoryCountScale) {
        return experimentalAggregatedData.slice(0, 20).map((row, index) => {
          const { w, h, x, y, circles } = categoricalBarBounds(row);
          const selectedPercent = hasSelected ? row.selectedIds.length / row.count : null;
          return (
            <>
              <SingleBar
                isVertical={isVertical}
                key={row.category}
                onClick={(e) => selectionCallback(e, row.ids)}
                selectedPercent={selectedPercent}
                tooltip={
                  <Stack gap={0}>
                    <Text>{`${categoryName}: ${row.category}`}</Text>
                    <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregatedValue}`}</Text>
                  </Stack>
                }
                width={w}
                height={h}
                x={x}
                y={y}
              />
              {false /* && index === 3 */ && (
                <g>
                  <circle cx={circles.value} cy={circles.id} r={5} fill="red" />
                  <circle cx={circles.zero} cy={circles.id} r={5} fill="red" />
                </g>
              )}
            </>
          );
        });
      }
      if (numericalValueScale && numericalIdScale) {
        return experimentalAggregatedData.slice(0, 100).map((row) => {
          const { w, h, x, y } = numericalBarBounds(row);
          const selectedPercent = !hasSelected || row.selectedIds.length > 0 ? 1 : 0;
          return (
            <SingleBar
              isVertical={isVertical}
              key={row.ids[0]}
              onClick={(e) => selectionCallback(e, row.ids)}
              selectedPercent={selectedPercent}
              tooltip={
                <Stack gap={0}>
                  <Text>{`ID: ${row.ids[0]}`}</Text>
                  <Text>{`${numericalName}: ${row.aggregatedValue}`}</Text>
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
    experimentalAggregatedData,
    width,
    height,
    categoryValueScale,
    categoryCountScale,
    numericalValueScale,
    numericalIdScale,
    categoricalBarBounds,
    hasSelected,
    isVertical,
    categoryName,
    aggregateType,
    aggregateColumnName,
    selectionCallback,
    numericalBarBounds,
    numericalName,
  ]);

  return <g>{bars}</g>;
}
