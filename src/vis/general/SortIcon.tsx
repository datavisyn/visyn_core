import * as React from 'react';
import { Tooltip, ActionIcon } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownShortWide, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import { VIS_LABEL_COLOR } from '../constants';
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
  variant = 'default',
  unsortedState = ESortStates.NONE,
}: {
  variant?: 'default' | 'values';
  unsortedState?: ESortStates.NONE | ESortStates.ASC;
  sortState: ESortStates;
  setSortState: (sortState: ESortStates) => void;
}) {
  const sortIcon =
    variant === 'values'
      ? sortState === ESortStates.DESC
        ? faArrowDownShortWide
        : sortState === ESortStates.ASC
          ? faArrowUpShortWide
          : unsortedState === ESortStates.NONE
            ? dvSort
            : faArrowUpShortWide
      : sortState === ESortStates.DESC
        ? dvSortDesc
        : sortState === ESortStates.ASC
          ? dvSortAsc
          : unsortedState === ESortStates.NONE
            ? dvSort
            : dvSortAsc;
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
    <Tooltip
      withArrow
      withinPortal
      label={sortState === ESortStates.ASC ? 'Sorted ascending' : sortState === ESortStates.DESC ? 'Sorted descending' : 'Click to sort'}
    >
      <ActionIcon
        onClick={() => setSortState(getNextSortState(sortState))}
        ml="xs"
        size="sm"
        color={sortState !== ESortStates.NONE ? selectionColorDark : VIS_LABEL_COLOR}
        variant="subtle"
      >
        <FontAwesomeIcon size="xs" icon={sortIcon} />
      </ActionIcon>
    </Tooltip>
  );
}
