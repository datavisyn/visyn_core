import { Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EAggregateTypes, VisColumn } from '../interfaces';
import { BarDisplayButtons } from './BarDisplayTypeButtons';
import { BarGroupTypeButtons } from './BarGroupTypeButtons';
import { EBarDisplayType, EBarGroupingType } from './interfaces';
import { SingleSelect } from '../sidebar/SingleSelect';

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
    <Stack gap="sm">
      <SingleSelect
        label="Group"
        callback={(e) => groupColumnSelectCallback(e ? columns.find((c) => c.info.id === e.id)?.info : null)}
        columns={columns}
        currentSelected={currentSelected}
        columnType={null}
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
