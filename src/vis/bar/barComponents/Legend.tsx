import React, { useMemo } from 'react';
import * as d3v7 from 'd3v7';
import { Stack, Chip, Tooltip, Box, ScrollArea, Group, Text, Center } from '@mantine/core';

export function Legend({
  categories,
  colorScale,
  onClick,
  height,
  groupedIds,
  left,
  isNumerical = false,
  stepSize = 0,
  selectedList,
  selectionCallback,
}: {
  categories: string[];
  groupedIds: { group: string; ids: string[] }[];
  colorScale: d3v7.ScaleOrdinal<string, string>;
  onClick: (string) => void;
  height: number;
  left: number;
  isNumerical?: boolean;
  stepSize?: number;
  selectedList: string[];
  selectionCallback: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, ids: string[]) => void;
}) {
  const selectedCat = useMemo(() => {
    return categories.find((cat) => {
      const myIds = groupedIds.find((group) => group.group === cat)?.ids || [];
      return selectedList.length === myIds.length && selectedList.every((value, index) => value === myIds[index]);
    });
  }, [categories, groupedIds, selectedList]);

  return (
    <ScrollArea style={{ height, marginLeft: left, flexShrink: 0 }}>
      <Group sx={{ width: '100%' }} spacing={2}>
        {categories.map((c) => {
          const myIds = groupedIds.find((group) => group.group === c)?.ids || [];

          return (
            <Tooltip withinPortal key={c} label={c} withArrow arrowSize={6}>
              <Stack spacing={0} onClick={(e) => selectionCallback(e, myIds)} style={{ cursor: 'pointer' }}>
                <svg width="60px" height="10px">
                  <rect width="60px" height="10px" fill={colorScale(c)} opacity={selectedCat ? (selectedCat === c ? 1 : 0.5) : 1} />
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
