import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { EViolinSeparationMode, EViolinOverlay } from './interfaces';

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

export function ViolinSeparationSegmentedControl({ callback, currentSelected }: SegmentedControlProps<EViolinSeparationMode>) {
  return (
    <Input.Wrapper label="Separation">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: EViolinSeparationMode.GROUP, value: EViolinSeparationMode.GROUP },
          { label: EViolinSeparationMode.FACETS, value: EViolinSeparationMode.FACETS },
        ]}
      />
    </Input.Wrapper>
  );
}
