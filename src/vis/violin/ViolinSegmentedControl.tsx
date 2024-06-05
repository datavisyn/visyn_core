import { Input, SegmentedControl, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EViolinSeparationMode, EViolinOverlay } from './interfaces';

interface SegmentedControlProps<T> {
  callback: (s: T) => void;
  currentSelected: T;
  disabled?: boolean;
}

export function ViolinOverlaySegmentedControl({ callback, currentSelected, disabled }: SegmentedControlProps<EViolinOverlay>) {
  return (
    <Input.Wrapper label="Overlay">
      <SegmentedControl
        disabled={disabled}
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
          { label: EViolinOverlay.BOX, value: EViolinOverlay.BOX },
          { label: EViolinOverlay.STRIP, value: EViolinOverlay.STRIP },
        ]}
      />
    </Input.Wrapper>
  );
}

export function ViolinSeparationSegmentedControl({ callback, currentSelected, disabled }: SegmentedControlProps<EViolinSeparationMode>) {
  return (
    <Input.Wrapper label="Separation">
      <Tooltip
        label={disabled ? 'Faceting not possible. Select at least two numerical or categorical columns.' : 'Group within plot or split into facets'}
        withArrow
      >
        <SegmentedControl
          fullWidth
          disabled={disabled}
          size="xs"
          value={disabled ? EViolinSeparationMode.GROUP : currentSelected}
          onChange={callback}
          data={[
            { label: EViolinSeparationMode.GROUP, value: EViolinSeparationMode.GROUP },
            { label: EViolinSeparationMode.FACETS, value: EViolinSeparationMode.FACETS },
          ]}
        />
      </Tooltip>
    </Input.Wrapper>
  );
}
