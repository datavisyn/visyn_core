import { Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, VisColumn } from '../interfaces';
import { NumericalColorButtons } from '../sidebar/NumericalColorButtons';
import { getCol } from '../sidebar/utils';
import { SingleSelect } from '../sidebar/SingleSelect';

interface ColorSelectProps {
  callback: (c: ColumnInfo) => void;
  numTypeCallback?: (c: ENumericalColorScaleType) => void;
  currentNumType?: ENumericalColorScaleType;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function ColorSelect({ callback, numTypeCallback = () => null, currentNumType = null, columns, currentSelected }: ColorSelectProps) {
  return (
    <Stack gap="sm">
      <SingleSelect
        callback={(e) => callback(e ? columns.find((c) => c.info.id === e.id)?.info : null)}
        columnType={null}
        columns={columns}
        currentSelected={currentSelected}
        label="Color"
      />
      {currentNumType && currentSelected && getCol(columns, currentSelected).type === EColumnTypes.NUMERICAL ? (
        <NumericalColorButtons callback={numTypeCallback} currentSelected={currentNumType} />
      ) : null}
    </Stack>
  );
}
