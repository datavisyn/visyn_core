import * as React from 'react';

import { Container, SegmentedControl, Stack } from '@mantine/core';

import { EBarGroupingType } from '../interfaces';

interface BarGroupTypeProps {
  callback: (s: EBarGroupingType) => void;
  currentSelected: EBarGroupingType;
}

export function BarGroupTypeButtons({ callback, currentSelected }: BarGroupTypeProps) {
  return (
    <Container p={0} fluid style={{ width: '100%' }}>
      <Stack gap={0}>
        <SegmentedControl
          value={currentSelected}
          onChange={(s) => {
            callback(s as EBarGroupingType);
          }}
          data={[
            { label: EBarGroupingType.GROUP, value: EBarGroupingType.GROUP },
            { label: EBarGroupingType.STACK, value: EBarGroupingType.STACK },
          ]}
        />
      </Stack>
    </Container>
  );
}
