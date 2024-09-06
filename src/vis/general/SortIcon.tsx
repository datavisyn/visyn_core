import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
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
  priority = 0,
  compact = false,
}: {
  sortState: ESortStates;
  setSortState: (sortState: ESortStates, isCtrlKeyPressed: boolean, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
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
    <Group onClick={(e) => setSortState(getNextSortState(sortState), e.ctrlKey, e)}>
      <Tooltip
        withArrow
        withinPortal
        label={sortState === ESortStates.ASC ? 'Sorted ascending' : sortState === ESortStates.DESC ? 'Sorted descending' : 'Click to sort'}
      >
        <ActionIcon
          data-testid="SortingButton"
          size={compact ? 'xs ' : 'sm'}
          color={sortState !== ESortStates.NONE ? selectionColorDark : VIS_LABEL_COLOR}
          variant="subtle"
        >
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

export function createPlotlySortIcon({
  sortState,
  axis,
  axisLabel,
  onToggleSort,
}: {
  sortState: { col: string; state: ESortStates };
  axis: string;
  axisLabel: string;
  onToggleSort: (col: string) => void;
}) {
  const icon = sortState?.col === axisLabel ? (sortState.state === ESortStates.ASC ? dvSortAsc.icon[4] : dvSortDesc.icon[4]) : dvSort.icon[4];
  const color = sortState?.col === axisLabel ? selectionColorDark : VIS_LABEL_COLOR;

  const isYAxis = axis.includes('y');
  const titleElement = d3v7.select(`g .${axis}title`);

  if (titleElement.node()) {
    // @ts-ignore
    const bounds = titleElement.node().getBoundingClientRect();
    const yOffset = isYAxis ? bounds.height / 2 + 30 : bounds.height - 5;
    const xOffset = isYAxis ? bounds.width / 2 : -(bounds.width / 2 + 15);
    const y = Number.parseInt(titleElement.attr('y'), 10) - yOffset;
    const x = Number.parseInt(titleElement.attr('x'), 10) - xOffset;
    if (d3v7.select(`g .g-${axis}title`).select('svg').empty()) {
      const title = d3v7.select(`g .g-${axis}title`);

      title
        .style('pointer-events', 'all')
        .append('svg')
        .attr('width', 14)
        .attr('height', 16)
        .attr('x', x)
        .attr('y', y)
        .attr('viewBox', '0 0 512 472')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('fill', color)
        .append('path')
        .style('stroke-width', '1')
        .attr('d', icon)
        .attr('transform', `${isYAxis ? 'rotate(-90, 256, 236)' : ''}`);

      title
        .append('foreignObject')
        .attr('width', 16)
        .attr('height', 18)
        .attr('x', x)
        .attr('y', y)
        .html(`<div></div>`)
        .style('cursor', 'pointer')
        .on('click', () => {
          onToggleSort(axisLabel);
        });
    }
  }
}
