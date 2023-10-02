import * as React from 'react';
import { Select, Stack } from '@mantine/core';
import { ColumnInfo, EColumnTypes, VisColumn, ENumericalColorScaleType } from '../interfaces';
import { SelectDropdownItem, getCol } from '../sidebar/utils';
import { NumericalColorButtons } from '../sidebar/NumericalColorButtons';

interface ColorSelectProps {
  callback: (c: ColumnInfo) => void;
  numTypeCallback?: (c: ENumericalColorScaleType) => void;
  currentNumType?: ENumericalColorScaleType;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function ColorSelect({ callback, numTypeCallback = () => null, currentNumType = null, columns, currentSelected }: ColorSelectProps) {
  return (
    <Stack spacing="sm">
      <Select
        withinPortal
        itemComponent={SelectDropdownItem}
        clearable
        placeholder="Select columns"
        label="Color"
        onChange={(e) => callback(columns.find((c) => c.info.id === e)?.info)}
        name="colorSelect"
        data={columns.map((c) => ({ value: c.info.id, label: c.info.name, description: c.info.description }))}
        value={currentSelected?.id || null}
      />
      {currentNumType && currentSelected && getCol(columns, currentSelected).type === EColumnTypes.NUMERICAL ? (
        <NumericalColorButtons callback={numTypeCallback} currentSelected={currentNumType} />
      ) : null}
    </Stack>
  );
}
