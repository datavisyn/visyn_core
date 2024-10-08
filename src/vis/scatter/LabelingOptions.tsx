import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, Input, SegmentedControl, Stack, Text, ThemeIcon } from '@mantine/core';
import * as React from 'react';
import { ELabelingOptions } from './interfaces';

interface LabelingOptionsProps {
  callback: (s: ELabelingOptions) => void;
  currentSelected: ELabelingOptions | null;
  labelLimit?: number;
}

export function LabelingOptions({ callback, currentSelected, labelLimit }: LabelingOptionsProps) {
  const displayLabelLimitCheck = React.useMemo(() => labelLimit > 0 && [ELabelingOptions.SELECTED].includes(currentSelected), [currentSelected, labelLimit]);

  return (
    <Stack>
      <Input.Wrapper label="Show labels">
        <SegmentedControl
          data-testid="LabelingOptions"
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
      {displayLabelLimitCheck && (
        <Group wrap="nowrap" gap={4} align="flex-start">
          <ThemeIcon variant="transparent" c="orange">
            <FontAwesomeIcon icon={faCircleExclamation} />
          </ThemeIcon>
          <Text size="xs" c="orange">
            Showing only the first {labelLimit} labels
          </Text>
        </Group>
      )}
    </Stack>
  );
}
