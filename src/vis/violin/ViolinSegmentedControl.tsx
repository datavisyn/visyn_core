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
        data-testid="ViolinOverlaySegmentedControl"
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

export function ViolinSyncYAxisSegmentedControl({
  callback,
  currentSelected,
  disabled,
  disableMerged,
}: SegmentedControlProps<EYAxisMode> & { disableMerged?: boolean }) {
  // If the merged option is disabled and the current selected is merged, change it to unsynced
  if (disableMerged && currentSelected === EYAxisMode.MERGED) {
    callback(EYAxisMode.UNSYNC);
  }

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
            { label: EYAxisMode.MERGED, value: EYAxisMode.MERGED, disabled: disableMerged },
          ]}
        />
      </Tooltip>
    </Input.Wrapper>
  );
}
