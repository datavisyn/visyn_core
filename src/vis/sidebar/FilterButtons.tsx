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
        <Tooltip label="Remove all points that are currently not selected">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.IN)}>
            Remove
          </Button>
        </Tooltip>
        <Tooltip label="Keep all currently selected points">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.OUT)}>
            Keep
          </Button>
        </Tooltip>
        <Tooltip label="Remove existing point filter">
          <Button style={{ flexGrow: 1 }} p={0} variant="default" onClick={() => callback(EFilterOptions.CLEAR)}>
            Clear
          </Button>
        </Tooltip>
      </Button.Group>
    </Input.Wrapper>
  );
}
