import { Group, Input, SegmentedControl } from '@mantine/core';
import * as React from 'react';
import { ENumericalColorScaleType } from '../interfaces';

interface NumericalColorButtonsProps {
  callback: (s: ENumericalColorScaleType) => void;
  currentSelected: ENumericalColorScaleType;
}

export function NumericalColorButtons({ callback, currentSelected }: NumericalColorButtonsProps) {
  const sequentialColors = ['#002245', '#214066', '#3e618a', '#5c84af', '#83a8c9', '#a9cfe4', '#cff6ff'];
  const divergentColors = ['#337ab7', '#7496c1', '#a5b4ca', '#d3d3d3', '#e5b19d', '#ec8e6a', '#ec6836'];

  return (
    <Input.Wrapper label="Color scale">
      <SegmentedControl
        data-testid="NumericalColorButtons"
        fullWidth
        value={currentSelected}
        onChange={callback}
        size="xs"
        data={[
          {
            label: (
              <Group gap={0} wrap="nowrap">
                {divergentColors.map((d) => {
                  return <span key={`colorScale ${d}`} style={{ border: '1px solid lightgrey', background: `${d}`, height: '1rem', width: '100%' }} />;
                })}
              </Group>
            ),
            value: ENumericalColorScaleType.DIVERGENT,
          },
          {
            label: (
              <Group gap={0} wrap="nowrap">
                {sequentialColors.map((d) => {
                  return <span key={`colorScale ${d}`} style={{ border: '1px solid lightgrey', background: `${d}`, height: '1rem', width: '100%' }} />;
                })}
              </Group>
            ),
            value: ENumericalColorScaleType.SEQUENTIAL,
          },
        ]}
      />
    </Input.Wrapper>
  );
}
