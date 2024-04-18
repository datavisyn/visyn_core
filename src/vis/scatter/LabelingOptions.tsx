import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { ELabelingOptions } from './interfaces';

interface LabelingOptionsProps {
  callback: (s: ELabelingOptions) => void;
  currentSelected: ELabelingOptions | null;
}

export function LabelingOptions({ callback, currentSelected }: LabelingOptionsProps) {
  return (
    <Input.Wrapper label="Show labels">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: ELabelingOptions.NEVER, value: ELabelingOptions.NEVER },
          { label: ELabelingOptions.ALWAYS, value: ELabelingOptions.ALWAYS },
          { label: ELabelingOptions.SELECTED, value: ELabelingOptions.SELECTED },
        ]}
      />
    </Input.Wrapper>
  );
}
