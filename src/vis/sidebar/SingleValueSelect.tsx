import { Select } from '@mantine/core';
import * as React from 'react';
import { SelectDropdownItem } from './utils';

interface SingleValueSelectProps {
  callback: (s: string) => void;
  availableFilterValues: string[];
  currentSelected: string;
  placeholder: string;
}

export function SingleValueSelect({ callback, availableFilterValues, currentSelected, placeholder }: SingleValueSelectProps) {
  return (
    <Select
      withinPortal
      itemComponent={SelectDropdownItem}
      clearable
      placeholder={placeholder}
      onChange={(e) => callback(e)}
      name="numColumns"
      data={availableFilterValues}
      value={currentSelected || null}
    />
  );
}
