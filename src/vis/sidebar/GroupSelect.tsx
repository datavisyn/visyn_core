import { Select, Stack } from '@mantine/core';
import * as React from 'react';
import { EBarDisplayType, EBarGroupingType } from '../barGood/interfaces';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisColumn } from '../interfaces';
import { BarDisplayButtons } from './BarDisplayTypeButtons';
import { BarGroupTypeButtons } from './BarGroupTypeButtons';
import { SelectDropdownItem } from './utils';

interface GroupSelectProps {
  groupColumnSelectCallback: (c: ColumnInfo) => void;
  groupTypeSelectCallback: (c: EBarGroupingType) => void;
  groupDisplaySelectCallback: (c: EBarDisplayType) => void;
  groupType: EBarGroupingType;
  displayType: EBarDisplayType;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
  aggregateType: EAggregateTypes;
}

export function GroupSelect({
  groupColumnSelectCallback,
  groupTypeSelectCallback,
  groupDisplaySelectCallback,
  groupType,
  displayType,
  columns,
  currentSelected,
  aggregateType,
}: GroupSelectProps) {
  return (
    <Stack spacing="sm">
      <Select
        withinPortal
        clearable
        itemComponent={SelectDropdownItem}
        placeholder="Select columns"
        label="Group"
        onChange={(e) => groupColumnSelectCallback(columns.find((c) => c.info.id === e)?.info)}
        data={columns
          .filter((c) => c.type === EColumnTypes.CATEGORICAL || c.type === EColumnTypes.NUMERICAL)
          .map((c) => ({ value: c.info.id, label: c.info.name, description: c.info.description }))}
        value={currentSelected?.id || null}
      />
      {currentSelected ? (
        <BarGroupTypeButtons callback={(newGroupType: EBarGroupingType) => groupTypeSelectCallback(newGroupType)} currentSelected={groupType} />
      ) : null}
      {currentSelected && groupType === EBarGroupingType.STACK ? (
        <BarDisplayButtons
          callback={(display: EBarDisplayType) => groupDisplaySelectCallback(display)}
          currentSelected={displayType}
          isCount={aggregateType === EAggregateTypes.COUNT}
        />
      ) : null}
    </Stack>
  );
}
