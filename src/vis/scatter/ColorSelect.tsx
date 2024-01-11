import { Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, VisColumn } from '../interfaces';
import { NumericalColorButtons } from '../sidebar/NumericalColorButtons';
import { getCol } from '../sidebar/utils';
import { SingeSelect } from '../sidebar/SingleSelect';

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
      <SingeSelect
        callback={(e) => callback(columns.find((c) => c.info.id === e.id)?.info)}
        columnType={EColumnTypes.CATEGORICAL}
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
