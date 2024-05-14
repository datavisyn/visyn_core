import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Center, Group, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { VIS_AXIS_LABEL_SIZE, VIS_AXIS_LABEL_SIZE_SMALL, VIS_LABEL_COLOR, VIS_TICK_LABEL_SIZE, VIS_TICK_LABEL_SIZE_SMALL } from '../../constants';
import { dvSort, dvSortAsc, dvSortDesc } from '../../../icons';

type IsEqual<Type1, Type2> = Type1 | Type2 extends Type1 & Type2 ? true : never;

// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({
  yScale,
  xRange,
  horizontalPosition,
  label,
  ticks,
  showLines,
  compact = false,
  sortedAsc = false,
  sortedDesc = false,
  setSortType,
}: {
  yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  xRange: [number, number];
  horizontalPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  showLines?: boolean;
  compact?: boolean;
  sortedAsc?: boolean;
  sortedDesc?: boolean;
  setSortType: (label: string) => void;
}) {
  const labelSpacing = useMemo(() => {
    const maxLabelLength = ticks.reduce((max, { value }) => {
      const { length } = `${value}`;
      return length > max ? length : max;
    }, 0);

    return maxLabelLength > 5 ? 30 : maxLabelLength * 6;
  }, [ticks]);

  const sortIcon = sortedDesc ? dvSortAsc : sortedAsc ? dvSortDesc : dvSort;

  return (
    <>
      <g transform={`translate(${horizontalPosition - labelSpacing - 30}, ${yScale.range()[0]}) rotate(-90)`}>
        <foreignObject width={Math.abs(yScale.range()[0] - yScale.range()[1])} height={20}>
          <Center>
            <Group gap={3} style={{ cursor: 'pointer' }}>
              <Text size={compact ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)} style={{ userSelect: 'none' }} c={VIS_LABEL_COLOR}>
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
        <g key={value} transform={`translate(${horizontalPosition}, ${offset})`}>
          {showLines ? <line x2={`${xRange[1] - xRange[0]}`} stroke="lightgray" /> : null}
          <g
            key={value}
            style={{
              transform: `translate(-${labelSpacing + 10}px, -9px)`,
            }}
          >
            <foreignObject width={labelSpacing} height={20}>
              <Group style={{ width: '100%', height: '100%' }} justify="right">
                <Tooltip withArrow label={value} withinPortal>
                  <Text
                    c={VIS_LABEL_COLOR}
                    pb={2} // to make sure the text is not cut off on the bottom, e.g. "g"s
                    truncate
                    style={{ userSelect: 'none' }}
                    size={compact ? rem(VIS_TICK_LABEL_SIZE_SMALL) : rem(VIS_TICK_LABEL_SIZE)}
                  >
                    {value}
                  </Text>
                </Tooltip>
              </Group>
            </foreignObject>
          </g>
        </g>
      ))}
    </>
  );
}
