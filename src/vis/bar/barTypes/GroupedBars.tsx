import React, { useCallback, useMemo } from 'react';
import * as d3 from 'd3v7';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { Stack, Text } from '@mantine/core';
import { SingleBar } from '../barComponents/SingleBar';
import { EAggregateTypes } from '../../interfaces';
import type { experimentalGroupByAggregateType } from '../utils';

export function GroupedBars({
  aggregateColumnName = null,
  aggregateType,
  categoryCountScale,
  categoryName,
  categoryValueScale,
  groupColorScale,
  groupedData,
  groupedTable,
  groupName,
  groupScale,
  hasSelected = false,
  height,
  isVertical = true,
  margin,
  numericalIdScale,
  numericalValueScale,
  selectionCallback,
  width,
}: {
  aggregateColumnName?: string;
  aggregateType?: EAggregateTypes;
  categoryCountScale: d3.ScaleLinear<number, number>;
  categoryName: string;
  categoryValueScale: d3.ScaleBand<string>;
  groupColorScale: d3.ScaleOrdinal<string, string>;
  groupedData: ReturnType<typeof experimentalGroupByAggregateType>;
  groupedTable?: ColumnTable;
  groupName: string;
  groupScale: d3.ScaleBand<string>;
  hasSelected?: boolean;
  height: number;
  isVertical?: boolean;
  margin: { top: number; bottom: number; left: number; right: number };
  numericalIdScale: d3.ScaleBand<string>;
  numericalValueScale: d3.ScaleLinear<number, number>;
  selectionCallback: (e: React.MouseEvent<SVGGElement, MouseEvent>, ids: string[]) => void;
  width: number;
}) {
  // const orderedMap = groupedTable
  //   ?.orderby('category', 'group')
  //   .objects()
  //   .map((row) => row);

  const categoricalBarBounds = useCallback(
    (row: ReturnType<typeof experimentalGroupByAggregateType>[number]) => {
      // x={isVertical ? categoryValueScale(row.category) + groupScale(row.group) : margin.left}
      // width={isVertical ? groupScale.bandwidth() : width - margin.right - categoryCountScale(row.aggregateVal)}
      // y={isVertical ? categoryCountScale(row.aggregateVal) : categoryValueScale(row.category) + groupScale(row.group)}
      // height={isVertical ? height - margin.bottom - categoryCountScale(row.aggregateVal) : groupScale.bandwidth()}
      const category = {
        zero: categoryCountScale(0),
        value: categoryCountScale(row.aggregatedValue),
        id: categoryValueScale(row.category as string),
        bandwidth: categoryValueScale.bandwidth() ?? 10,
      };
      const group = {
        value: groupScale(row.group as string),
        id: groupScale(row.group as string),
        bandwidth: groupScale.bandwidth() ?? 10,
      };
      const color = groupColorScale(row.group as string);
      let [w, h, x, y] = [0, 0, 0, 0];

      if (isVertical) {
        w = group.bandwidth;
        h = Math.max(Math.abs(category.zero - category.value), 2);
        x = category.id + group.id;
        y = category.value;
      } else {
        w = Math.max(Math.abs(category.value - category.zero), 2);
        h = group.bandwidth;
        x = category.zero;
        y = group.id;
      }

      // NOTE: @dv-usama-ansari: Use circles for debugging
      const circles = { category, group };

      return { w, h, x, y, color, circles };
    },
    [categoryCountScale, categoryValueScale, groupColorScale, groupScale, isVertical],
  );

  // TODO: @dv-usama-ansari: Implement numerical bar bounds when the data is numerical
  const numericalBarBounds = useCallback(
    (row: ReturnType<typeof experimentalGroupByAggregateType>[number]) => {
      const zero = numericalValueScale(0);
      const value = numericalValueScale(row.aggregatedValue);
      const id = numericalIdScale(row.ids[0]);
      const bandwidth = numericalIdScale.bandwidth() ?? 10;
      const color = groupColorScale(row.ids[0] as string);
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

      return { w, h, x, y, color, circles };
    },
    [numericalValueScale, numericalIdScale, groupColorScale, isVertical],
  );

  const bars = useMemo(() => {
    if (groupedData && width !== 0 && height !== 0) {
      if (categoryValueScale && categoryCountScale) {
        return groupedData?.map((row, index) => {
          const { w, h, x, y, color, circles } = categoricalBarBounds(row);
          const selectedPercent = hasSelected ? row.selectedIds.length / row.count : null;
          return (
            <>
              <SingleBar
                onClick={(e) => selectionCallback(e, row.ids)}
                isVertical={isVertical}
                selectedPercent={selectedPercent}
                key={`${row.category}${row.group}`}
                // x={isVertical ? categoryValueScale(row.category) + groupScale(row.group) : margin.left}
                // width={isVertical ? groupScale.bandwidth() : width - margin.right - categoryCountScale(row.aggregateVal)}
                // y={isVertical ? categoryCountScale(row.aggregateVal) : categoryValueScale(row.category) + groupScale(row.group)}
                // height={isVertical ? height - margin.bottom - categoryCountScale(row.aggregateVal) : groupScale.bandwidth()}
                width={w}
                height={h}
                x={x}
                y={y}
                tooltip={
                  <Stack gap={0}>
                    <Text>{`${categoryName}: ${row.category}`}</Text>
                    <Text>{`${groupName}: ${row.group}`}</Text>
                    <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregatedValue}`}</Text>
                  </Stack>
                }
                color={color}
              />
              {index === 1 && (
                <g>
                  {/* <circle cx={circles.category.id} cy={circles.category.value} r={5} fill="red" /> */}
                  <circle cx={circles.category.id + circles.group.bandwidth * index} cy={circles.group.id} r={5} fill="blue" />
                </g>
              )}
            </>
          );
        });
      }
      if (numericalValueScale && numericalIdScale) {
        return groupedData?.map((row) => {
          // NOTE: @dv-usama-ansari: The numerical bar bounds are not implemented yet
          const { w, h, x, y, color, circles } = numericalBarBounds(row);
          const selectedPercent = hasSelected ? row.selectedIds.length / row.count : null;
          return (
            <SingleBar
              onClick={(e) => selectionCallback(e, row.ids)}
              isVertical={isVertical}
              selectedPercent={selectedPercent}
              key={`${row.category}${row.group}`}
              // x={isVertical ? categoryValueScale(row.category) + groupScale(row.group) : margin.left}
              // width={isVertical ? groupScale.bandwidth() : width - margin.right - categoryCountScale(row.aggregateVal)}
              // y={isVertical ? categoryCountScale(row.aggregateVal) : categoryValueScale(row.category) + groupScale(row.group)}
              // height={isVertical ? height - margin.bottom - categoryCountScale(row.aggregateVal) : groupScale.bandwidth()}
              width={w}
              height={h}
              x={x}
              y={y}
              tooltip={
                <Stack gap={0}>
                  <Text>{`${categoryName}: ${row.category}`}</Text>
                  <Text>{`${groupName}: ${row.group}`}</Text>
                  <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregatedValue}`}</Text>
                </Stack>
              }
              color={color}
            />
          );
        });
      }
    }
    return null;
  }, [
    groupedData,
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
    groupName,
    aggregateType,
    aggregateColumnName,
    selectionCallback,
    numericalBarBounds,
  ]);

  return <g>{bars}</g>;
}
