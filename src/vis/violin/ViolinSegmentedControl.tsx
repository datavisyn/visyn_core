import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { EViolinMultiplesMode, EViolinOverlay } from './interfaces';

interface SegmentedControlProps<T> {
  callback: (s: T) => void;
  currentSelected: T;
}

export function ViolinOverlaySegmentedControl({ callback, currentSelected }: SegmentedControlProps<EViolinOverlay>) {
  return (
    <Input.Wrapper label="Overlay">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
          { label: EViolinOverlay.BOX, value: EViolinOverlay.BOX },
        ]}
      />
    </Input.Wrapper>
  );
}

export function ViolinMultiplesSegmentedControl({ callback, currentSelected }: SegmentedControlProps<EViolinMultiplesMode>) {
  return (
    <Input.Wrapper label="Multiples">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: EViolinMultiplesMode.GROUP, value: EViolinMultiplesMode.GROUP },
          { label: EViolinMultiplesMode.FACETS, value: EViolinMultiplesMode.FACETS },
        ]}
      />
    </Input.Wrapper>
  );
}
