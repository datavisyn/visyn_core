import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { ELabelingOptions } from './interfaces';

interface LabelingOptionsProps {
  callback: (s: ELabelingOptions) => void;
  currentSelected: ELabelingOptions;
}

export function LabelingOptions({ callback, currentSelected }: LabelingOptionsProps) {
  return (
    <Input.Wrapper label="Labels">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: ELabelingOptions.SELECTED, value: ELabelingOptions.SELECTED },
          { label: ELabelingOptions.ON, value: ELabelingOptions.ON },
          { label: ELabelingOptions.OFF, value: ELabelingOptions.OFF },
        ]}
      />
    </Input.Wrapper>
  );
}
