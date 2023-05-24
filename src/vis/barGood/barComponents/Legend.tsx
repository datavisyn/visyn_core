import React, { useMemo } from 'react';
import * as d3v7 from 'd3v7';
import { Stack, Chip, Tooltip, Box, ScrollArea, Group, Text, Center } from '@mantine/core';

export function Legend({
  categories,
  filteredCategories,
  colorScale,
  onClick,
  height,
  left,
  isNumerical = false,
  stepSize = 0,
}: {
  categories: string[];
  filteredCategories: string[];
  colorScale: d3v7.ScaleOrdinal<string, string>;
  onClick: (string) => void;
  height: number;
  left: number;
  isNumerical?: boolean;
  stepSize?: number;
}) {
  return (
    <ScrollArea style={{ height, marginLeft: left, flexShrink: 0 }}>
      <Group sx={{ width: '100%' }} spacing={2}>
        {categories.map((c) => {
          return (
            <Tooltip withinPortal key={c} label={c} withArrow arrowSize={6}>
              <Stack spacing={0}>
                <svg width="60px" height="10px">
                  <rect width="60px" height="10px" fill={colorScale(c)} />
                </svg>
                <Center>
                  <Text size={12} onClick={() => onClick(c)}>
                    {isNumerical ? `${c} - ${+c + stepSize}` : c}
                  </Text>
                </Center>
              </Stack>
            </Tooltip>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
