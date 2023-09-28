import { Button, Stack, Tooltip, Text } from '@mantine/core';
import * as React from 'react';
import { EFilterOptions } from '../interfaces';

interface FilterButtonsProps {
  callback: (s: EFilterOptions) => void;
}

export function FilterButtons({ callback }: FilterButtonsProps) {
  return (
    <Stack mt="md" p={0} style={{ width: '100%' }} gap="xs">
      <Text fw={500} size="sm">
        Filter
      </Text>
      <Button.Group>
        <Tooltip label="Filters any point not currently selected">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.IN)}>
            {EFilterOptions.IN}
          </Button>
        </Tooltip>
        <Tooltip label="Filters all currently selected points">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.OUT)}>
            {EFilterOptions.OUT}
          </Button>
        </Tooltip>
        <Tooltip label="Removes any existing filter">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.CLEAR)}>
            {EFilterOptions.CLEAR}
          </Button>
        </Tooltip>
      </Button.Group>
    </Stack>
  );
}
