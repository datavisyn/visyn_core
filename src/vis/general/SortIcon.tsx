import { faArrowDownShortWide, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Text, Tooltip } from '@mantine/core';
import * as d3v7 from 'd3v7';
import * as React from 'react';
import { dvSort, dvSortAsc, dvSortDesc } from '../../icons';
import { selectionColorDark } from '../../utils';
import { VIS_LABEL_COLOR } from './constants';

export enum ESortStates {
  NONE = 'none',
  ASC = 'asc',
  DESC = 'desc',
}

export function SortIcon({
  sortState,
  setSortState,
  variant = 'default',
  priority = 0,
}: {
  variant?: 'default' | 'values';
  sortState: ESortStates;
  setSortState: (sortState: ESortStates) => void;
  priority?: number;
}) {
  const sortIcon =
    variant === 'values'
      ? sortState === ESortStates.DESC
        ? faArrowDownShortWide
        : sortState === ESortStates.ASC
          ? faArrowUpShortWide
          : dvSort
      : sortState === ESortStates.DESC
        ? dvSortDesc
        : sortState === ESortStates.ASC
          ? dvSortAsc
          : dvSort;
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
        size="sm"
        color={sortState !== ESortStates.NONE ? selectionColorDark : VIS_LABEL_COLOR}
        variant="subtle"
      >
        {priority !== null && priority > 0 && (
          <Text size="0.6rem" mr="2px" fw={500}>
            {priority}.
          </Text>
        )}
        <FontAwesomeIcon size="xs" icon={sortIcon} />
      </ActionIcon>
    </Tooltip>
  );
}

export function createPlotlySortIconY({
  sortState,
  yAxis,
  yLabel,
  onToggleSort,
}: {
  sortState: { col: string; state: ESortStates };
  yAxis: string;
  yLabel: string;
  onToggleSort: (col: string) => void;
}) {
  const icon =
    sortState?.col === yLabel ? (sortState.state === ESortStates.ASC ? 'fa-arrow-up-short-wide' : 'fa-arrow-down-short-wide') : 'fa-arrow-down-short-wide';
  const color = sortState?.col === yLabel ? selectionColorDark : VIS_LABEL_COLOR;

  const titleElement = d3v7.select(`g .${yAxis}title`);
  // @ts-ignore
  const yOffset = titleElement.node().getBoundingClientRect().height / 2 + 40;
  // @ts-ignore
  const xOffset = titleElement.node().getBoundingClientRect().width - 5;
  const y = Number.parseInt(titleElement.attr('y'), 10) - yOffset;
  // TODO: How to get the proper x offset?
  const x = Number.parseInt(titleElement.attr('x'), 10) - xOffset;

  d3v7
    .select(`g .g-${yAxis}title`)
    .style('pointer-events', 'all')
    .on('click', () => {
      onToggleSort(yLabel);
    })
    .append('foreignObject')
    .attr('width', 20)
    .attr('height', 20)
    .attr('y', y)
    .attr('x', x)
    .html(`<span style="font-size: 0.8em; color: ${color}; transform: rotate(270deg); display: block;"><i class="fa-solid ${icon}"></i></span>`);
}
