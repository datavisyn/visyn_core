import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Center, Group, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { SortTypes } from '../interfaces';
import { VIS_AXIS_LABEL_SIZE, VIS_AXIS_LABEL_SIZE_SMALL, VIS_LABEL_COLOR, VIS_TICK_LABEL_SIZE, VIS_TICK_LABEL_SIZE_SMALL } from '../../constants';
import { dvSortAsc, dvSortDesc, dvSort } from '../../../icons';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({
  xScale,
  yRange,
  vertPosition,
  label,
  ticks,
  showLines,
  compact = false,
  sortedAsc = false,
  sortedDesc = false,
  setSortType,
}: {
  showLines?: boolean;
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
  vertPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  compact?: boolean;
  sortedAsc?: boolean;
  sortedDesc?: boolean;
  setSortType: (label: string) => void;
}) {
  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].offset - ticks[0].offset);
    }

    return xScale.range()[0] - xScale.range()[1];
  }, [ticks, xScale]);

  const sortIcon = sortedDesc ? dvSortAsc : sortedAsc ? dvSortDesc : dvSort;

  return (
    <>
      <g transform={`translate(${xScale.range()[1]}, ${vertPosition + 25})`}>
        <foreignObject width={Math.abs(xScale.range()[0] - xScale.range()[1])} height={20}>
          <Center>
            <Group gap={3} style={{ cursor: 'pointer' }}>
              <Text style={{ userSelect: 'none' }} size={compact ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)} c={VIS_LABEL_COLOR}>
                {label}
              </Text>
              <Tooltip withArrow withinPortal label={sortedDesc ? 'Sorted ascending' : sortedAsc ? 'Sorted descending' : 'Click to sort'}>
                <ActionIcon onClick={() => setSortType(label)} ml="xs" size="sm" color={VIS_LABEL_COLOR} variant="subtle">
                  <FontAwesomeIcon size="xs" icon={sortIcon} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Center>
        </foreignObject>
      </g>

      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${offset}, ${vertPosition})`}>
          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" /> : null}
          <foreignObject x={0 - tickWidth / 2} y={10} width={tickWidth} height={20}>
            <Center>
              <Tooltip withinPortal label={value} withArrow>
                <Text
                  c={VIS_LABEL_COLOR}
                  px={2}
                  size={compact ? rem(VIS_TICK_LABEL_SIZE_SMALL) : rem(VIS_TICK_LABEL_SIZE)}
                  style={{ userSelect: 'none', textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {value}
                </Text>
              </Tooltip>
            </Center>
          </foreignObject>
        </g>
      ))}
    </>
  );
}
