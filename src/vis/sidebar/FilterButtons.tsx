import { Button, Input, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EFilterOptions } from '../interfaces';

interface FilterButtonsProps {
  callback: (s: EFilterOptions) => void;
}

export function FilterButtons({ callback }: FilterButtonsProps) {
  return (
    <Input.Wrapper label="Selected points">
      <Button.Group>
        <Tooltip label="Keep selected points, remove other points">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.IN)} size="xs">
            Keep
          </Button>
        </Tooltip>
        <Tooltip label="Remove selected points, keep other points">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.OUT)} size="xs">
            Remove
          </Button>
        </Tooltip>
        <Tooltip label="Clear all point filters">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.CLEAR)} size="xs">
            Clear
          </Button>
        </Tooltip>
      </Button.Group>
    </Input.Wrapper>
  );
}
