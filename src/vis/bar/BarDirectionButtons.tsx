import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { EBarDirection } from './interfaces';

interface BarDirectionProps {
  callback: (s: EBarDirection) => void;
  currentSelected: EBarDirection;
}

export function BarDirectionButtons({ callback, currentSelected }: BarDirectionProps) {
  return (
    <Input.Wrapper label="Direction">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: EBarDirection.VERTICAL, value: EBarDirection.VERTICAL },
          { label: EBarDirection.HORIZONTAL, value: EBarDirection.HORIZONTAL },
        ]}
      />
    </Input.Wrapper>
  );
}
