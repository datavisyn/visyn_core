import * as React from 'react';

import { Box, BoxComponentProps, Group, Slider, Text } from '@mantine/core';

import { adjustDomain } from './math';

export function CutoffSlider({
  domain,
  value,
  onChange,
  ...others
}: {
  domain: number[];
  value: number;
  onChange: (value: number) => void;
} & BoxComponentProps) {
  const adjustedDomain = adjustDomain(domain);

  return (
    <Box {...others}>
      <Group>
        <Text size="sm">Cutoff filter</Text>
        <Slider w={200} step={0.01} min={adjustedDomain[0]} max={adjustedDomain[1]} value={value} onChange={onChange} />
      </Group>
    </Box>
  );
}
