import { Container, SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import { EBarDisplayType } from '../interfaces';

interface BarDisplayProps {
  callback: (s: EBarDisplayType) => void;
  currentSelected: EBarDisplayType;
  isCount: boolean;
}

export function BarDisplayButtons({ callback, currentSelected, isCount }: BarDisplayProps) {
  return (
    <Container p={0} fluid style={{ width: '100%' }}>
      <Stack gap={0}>
        <SegmentedControl
          disabled={!isCount}
          value={isCount ? currentSelected : EBarDisplayType.ABSOLUTE}
          onChange={(s) => {
            callback(s as EBarDisplayType);
          }}
          data={[
            { label: EBarDisplayType.ABSOLUTE, value: EBarDisplayType.ABSOLUTE },
            { label: EBarDisplayType.NORMALIZED, value: EBarDisplayType.NORMALIZED },
          ]}
        />
      </Stack>
    </Container>
  );
}
