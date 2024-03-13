import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { EViolinOverlay } from './interfaces';

interface ViolinOverlayProps {
  callback: (s: EViolinOverlay) => void;
  currentSelected: EViolinOverlay;
}

export function ViolinOverlayButtons({ callback, currentSelected }: ViolinOverlayProps) {
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
