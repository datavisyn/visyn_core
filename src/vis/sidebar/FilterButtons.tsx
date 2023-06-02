import { Button, Stack, Tooltip, Text } from '@mantine/core';
import * as React from 'react';
import { EFilterOptions } from '../interfaces';

interface FilterButtonsProps {
  callback: (s: EFilterOptions) => void;
}

export function FilterButtons({ callback }: FilterButtonsProps) {
  return (
    <Stack mt="md" p={0} sx={{ width: '100%' }} spacing="xs">
      <Text weight={500} size={14}>
        Filter
      </Text>
      <Button.Group buttonBorderWidth={2}>
        <Tooltip withinPortal label="Filters any point not currently selected">
          <Button sx={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.IN)}>
            {EFilterOptions.IN}
          </Button>
        </Tooltip>
        <Tooltip withinPortal label="Filters all currently selected points">
          <Button sx={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.OUT)}>
            {EFilterOptions.OUT}
          </Button>
        </Tooltip>
        <Tooltip withinPortal label="Removes any existing filter">
          <Button sx={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.CLEAR)}>
            {EFilterOptions.CLEAR}
          </Button>
        </Tooltip>
      </Button.Group>
    </Stack>
  );
}
