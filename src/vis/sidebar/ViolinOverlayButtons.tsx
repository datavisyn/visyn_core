import { Container, SegmentedControl, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { EViolinOverlay } from '../interfaces';

interface ViolinOverlayProps {
  callback: (s: EViolinOverlay) => void;
  currentSelected: EViolinOverlay;
}

export function ViolinOverlayButtons({ callback, currentSelected }: ViolinOverlayProps) {
  return (
    <Container p={0} fluid style={{ width: '100%' }}>
      <Stack gap={0}>
        <Text fw={500} size="sm">
          Overlay
        </Text>
        <SegmentedControl
          value={currentSelected}
          onChange={callback}
          data={[
            { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
            { label: EViolinOverlay.BOX, value: EViolinOverlay.BOX },
          ]}
        />
      </Stack>
    </Container>
  );
}
