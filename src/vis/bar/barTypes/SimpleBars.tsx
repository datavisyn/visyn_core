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
      const aggregatedTableObjects = aggregatedTable.objects().slice(0, 100);
      if (categoryValueScale && categoryCountScale) {
        return aggregatedTableObjects.map((row: { category: string; count: number; aggregateVal: number; selectedCount: number; ids: string[] }, index) => {
          return (
            <SingleBar
              isVertical={isVertical}
              key={row.category}
              onClick={(e) => selectionCallback(e, row.ids)}
              selectedPercent={hasSelected ? row.selectedCount / row.count : null}
              tooltip={
                <Stack gap={0}>
                  <Text>{`${categoryName}: ${row.category}`}</Text>
                  <Text>{`${aggregateType}${aggregateColumnName ? ` ${aggregateColumnName}` : ''}: ${row.aggregateVal}`}</Text>
                </Stack>
              }
              width={isVertical ? categoryValueScale.bandwidth() ?? 10 : width - margin.right - categoryCountScale(row.aggregateVal)}
              height={isVertical ? height - margin.bottom - categoryCountScale(row.aggregateVal) : categoryValueScale.bandwidth()}
              x={isVertical ? categoryValueScale(row.category) ?? 10 * index : margin.left}
              y={isVertical ? categoryCountScale(row.aggregateVal) : categoryValueScale(row.category) ?? 10 * index}
            />
          );
        });
      }
      if (numericalValueScale && numericalIdScale) {
        return aggregatedTableObjects.map((row: { numerical: number; selected: number; id: string }, index) => {
          return (
            <SingleBar
              isVertical={isVertical}
              key={row.id}
              onClick={(e) => selectionCallback(e, [row.id])}
              selectedPercent={0}
              tooltip={
                <Stack gap={0}>
                  <Text>{`ID: ${row.id}`}</Text>
                  <Text>{`${numericalName}: ${row.numerical}`}</Text>
                </Stack>
              }
              width={isVertical ? numericalIdScale.bandwidth() ?? 10 : width - margin.right - numericalValueScale(row.numerical)}
              height={isVertical ? height - margin.bottom - numericalValueScale(row.numerical) : numericalIdScale.bandwidth()}
              x={isVertical ? numericalIdScale(row.id) ?? 10 * index : margin.left}
              y={isVertical ? numericalValueScale(row.numerical) : numericalIdScale(row.id) ?? 10 * index}
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
