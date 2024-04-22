import { Button, Input, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EFilterOptions } from '../interfaces';

interface FilterButtonsProps {
  callback: (s: EFilterOptions) => void;
}

export function FilterButtons({ callback }: FilterButtonsProps) {
  return (
    <Input.Wrapper label="Filter">
      <Button.Group>
        <Tooltip label="Filters any point not currently selected">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.IN)} size="xs">
            {EFilterOptions.IN}
          </Button>
        </Tooltip>
        <Tooltip label="Filters all currently selected points">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.OUT)} size="xs">
            {EFilterOptions.OUT}
          </Button>
        </Tooltip>
        <Tooltip label="Removes any existing filter">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.CLEAR)} size="xs">
            {EFilterOptions.CLEAR}
          </Button>
        </Tooltip>
      </Button.Group>
    </Input.Wrapper>
  );
}
