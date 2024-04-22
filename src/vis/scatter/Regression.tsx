import { Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { ERegressionLineOptions } from '../interfaces';

interface RegressionLineOptionsProps {
  callback: (s: ERegressionLineOptions) => void;
  currentSelected: ERegressionLineOptions | null;
}

export function RegressionLineOptions({ callback, currentSelected }: RegressionLineOptionsProps) {
  return (
    <Input.Wrapper label="Regression line">
      <SegmentedControl
        fullWidth
        size="xs"
        value={currentSelected}
        onChange={callback}
        data={[
          { label: ERegressionLineOptions.NONE, value: ERegressionLineOptions.NONE },
          { label: ERegressionLineOptions.LINEAR, value: ERegressionLineOptions.LINEAR },
          { label: ERegressionLineOptions.NON_LINEAR, value: ERegressionLineOptions.NON_LINEAR },
        ]}
      />
    </Input.Wrapper>
  );
}
