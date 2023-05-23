import React from 'react';
import * as d3v7 from 'd3v7';
import { Stack, Chip, Tooltip, Box, ScrollArea, Group } from '@mantine/core';

export function Legend({
  categories,
  filteredCategories,
  colorScale,
  onClick,
  height,
  left,
}: {
  categories: string[];
  filteredCategories: string[];
  colorScale: d3v7.ScaleOrdinal<string, string>;
  onClick: (string) => void;
  height: number;
  left: number;
}) {
  console.log(categories);
  return (
    <ScrollArea style={{ height, position: 'absolute', left }}>
      <Group sx={{ width: '100%' }} spacing={10}>
        {categories.map((c) => {
          return (
            <Tooltip withinPortal key={c} label={c} withArrow arrowSize={6}>
              <Box>
                <Chip
                  variant="filled"
                  onClick={() => onClick(c)}
                  checked={false}
                  size="xs"
                  styles={{
                    label: {
                      width: '100%',
                      backgroundColor: filteredCategories.includes(c) ? 'lightgrey' : `${colorScale(c)} !important`,
                      textAlign: 'center',
                      paddingLeft: '10px',
                      paddingRight: '10px',
                      overflow: 'hidden',
                      color: filteredCategories.includes(c) ? 'black' : 'white',
                      textOverflow: 'ellipsis',
                    },
                  }}
                >
                  {c}
                </Chip>
              </Box>
            </Tooltip>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
