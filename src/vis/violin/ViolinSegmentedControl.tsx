import { Input, SegmentedControl, Tooltip, Text } from '@mantine/core';
import * as React from 'react';
import { EViolinOverlay, EYAxisMode } from './interfaces';

interface SegmentedControlProps<T> {
  callback: (s: T) => void;
  currentSelected: T;
  disabled?: boolean;
}

const violinOverlayOptions = [
  { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
  { label: EViolinOverlay.BOX, value: EViolinOverlay.BOX },
  { label: EViolinOverlay.STRIP, value: EViolinOverlay.STRIP },
];

const boxplotOverlayOptions = [
  { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
  { label: EViolinOverlay.STRIP, value: EViolinOverlay.STRIP },
];

export function ViolinOverlaySegmentedControl({
  callback,
  currentSelected,
  disabled,
  isViolin,
}: SegmentedControlProps<EViolinOverlay> & { isViolin: boolean }) {
  return (
    <Input.Wrapper
      label={
        <Text size="sm" fw={500} c={disabled ? 'dimmed' : 'black'}>
          Overlay
        </Text>
      }
    >
      <SegmentedControl
        disabled={disabled}
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={isViolin ? violinOverlayOptions : boxplotOverlayOptions}
      />
    </Input.Wrapper>
  );
}

export function ViolinSyncYAxisSegmentedControl({ callback, currentSelected, disabled }: SegmentedControlProps<EYAxisMode>) {
  return (
    <Input.Wrapper
      label={
        <Text size="sm" fw={500} c={disabled ? 'dimmed' : 'black'}>
          Y-Axis
        </Text>
      }
    >
      <Tooltip label={disabled ? 'Sync only available when having multiple plots' : 'Sync the y-axis range of all plots'} withArrow>
        <SegmentedControl
          data-testid="ViolinYAxisSegmentedControl"
          fullWidth
          disabled={disabled}
          size="xs"
          value={currentSelected}
          onChange={callback}
          data={[
            { label: EYAxisMode.UNSYNC, value: EYAxisMode.UNSYNC },
            { label: EYAxisMode.SYNC, value: EYAxisMode.SYNC },
          ]}
        />
      </Tooltip>
    </Input.Wrapper>
  );
}
