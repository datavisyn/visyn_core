import { Group, ScrollArea } from '@mantine/core';
import * as d3v7 from 'd3v7';
import React from 'react';
import { LegendItem } from '../../LegendItem';

export function Legend({
  categories,
  colorScale,
  left,
  isNumerical = false,
  stepSize = 0,
  filteredOut,
  onFilteredOut,
}: {
  categories: string[];
  colorScale: d3v7.ScaleOrdinal<string, string>;
  left: number;
  isNumerical?: boolean;
  stepSize?: number;
  filteredOut: string[];
  onFilteredOut: (id: string) => void;
}) {
  return (
    <ScrollArea.Autosize mah={28 * 3} style={{ marginLeft: left, flexShrink: 0 }}>
      <Group style={{ width: '100%' }} gap={2}>
        {categories.map((c) => {
          return (
            <LegendItem
              key={c}
              color={colorScale(c)}
              label={isNumerical ? `${c} - ${+c + stepSize}` : c}
              filtered={filteredOut.includes(c)}
              onClick={() => onFilteredOut(c)}
            />
          );
        })}
      </Group>
    </ScrollArea.Autosize>
  );
}
