import { Center, Group, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import * as d3v7 from 'd3v7';
import React, { useMemo } from 'react';

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
      <Group style={{ width: '100%' }} gap={2}>
        {categories.map((c) => {
          const myIds = groupedIds.find((group) => group.group === c)?.ids || [];

          return (
            <Tooltip withinPortal key={c} label={c} withArrow arrowSize={6}>
              <Stack gap={0} onClick={(e) => selectionCallback(e, myIds)} style={{ cursor: 'pointer' }}>
                <svg width="60px" height="10px">
                  <rect width="60px" height="10px" fill={colorScale(c)} opacity={selectedCat ? (selectedCat === c ? 1 : 0.5) : 1} />
                </svg>
                <Center>
                  <Text size="xs" onClick={() => onClick(c)}>
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
