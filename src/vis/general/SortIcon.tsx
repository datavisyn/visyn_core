import * as React from 'react';
import { Tooltip, ActionIcon, Text, Group } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VIS_LABEL_COLOR } from './constants';
import { dvSort, dvSortAsc, dvSortDesc } from '../../icons';
import { selectionColorDark } from '../../utils';

export enum ESortStates {
  NONE = 'none',
  ASC = 'asc',
  DESC = 'desc',
}

export function SortIcon({
  sortState,
  setSortState,
  priority = 0,
  compact = false,
}: {
  sortState: ESortStates;
  setSortState: (sortState: ESortStates) => void;
  priority?: number;
  compact?: boolean;
}) {
  const sortIcon = sortState === ESortStates.DESC ? dvSortDesc : sortState === ESortStates.ASC ? dvSortAsc : dvSort;
  const getNextSortState = (s) => {
    switch (s) {
      case ESortStates.ASC:
        return ESortStates.DESC;
      case ESortStates.DESC:
        return ESortStates.NONE;
      default:
        return ESortStates.ASC;
    }
  };

  return (
    <Group onClick={() => setSortState(getNextSortState(sortState))}>
      <Tooltip
        withArrow
        withinPortal
        label={sortState === ESortStates.ASC ? 'Sorted ascending' : sortState === ESortStates.DESC ? 'Sorted descending' : 'Click to sort'}
      >
        <ActionIcon size={compact ? 'xs ' : 'sm'} color={sortState !== ESortStates.NONE ? selectionColorDark : VIS_LABEL_COLOR} variant="subtle">
          {priority !== null && priority > 0 && (
            <Text size="0.6rem" mr="2px" fw={500}>
              {priority}.
            </Text>
          )}
          <FontAwesomeIcon size={compact ? '2xs' : 'xs'} icon={sortIcon} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
