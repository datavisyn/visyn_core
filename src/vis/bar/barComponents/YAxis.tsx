import { Center, Group, Space, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import {
  VIS_AXIS_LABEL_SIZE,
  VIS_AXIS_LABEL_SIZE_SMALL,
  VIS_GRID_COLOR,
  VIS_LABEL_COLOR,
  VIS_TICK_LABEL_SIZE,
  VIS_TICK_LABEL_SIZE_SMALL,
} from '../../constants';
import { ESortStates, SortIcon } from '../../general/SortIcon';

// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({
  compact = false,
  horizontalPosition,
  isVertical = false,
  label,
  setSortType,
  showLines,
  sortedAsc = false,
  sortedDesc = false,
  ticks,
  xRange,
  yScale,
}: {
  compact?: boolean;
  isVertical?: boolean;
  horizontalPosition: number;
  label: string;
  setSortType: (label: string, nextSortState: ESortStates) => void;
  showLines?: boolean;
  sortedAsc?: boolean;
  sortedDesc?: boolean;
  ticks: { value: string | number; offset: number }[];
  xRange: [number, number];
  yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
}) {
  const labelSpacing = useMemo(() => {
    const maxLabelLength = ticks.reduce((max, { value }) => {
      const { length } = `${value}`;
      return length > max ? length : max;
    }, 0);

    return maxLabelLength > 5 ? 30 : maxLabelLength * 6;
  }, [ticks]);

  return (
    <>
      <g transform={`translate(${horizontalPosition - labelSpacing - 30}, ${yScale.range()[0]}) rotate(-90)`}>
        <foreignObject width={Math.abs(yScale.range()[0] - yScale.range()[1])} height={20}>
          <Center>
            <Group gap={3}>
              <Text size={compact ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)} style={{ userSelect: 'none' }} c={VIS_LABEL_COLOR}>
                {label}
              </Text>
              <Space ml="xs" />
              <SortIcon
                sortState={sortedDesc ? ESortStates.DESC : sortedAsc ? ESortStates.ASC : ESortStates.NONE}
                setSortState={(nextSort: ESortStates) => setSortType(label, nextSort)}
              />
            </Group>
          </Center>
        </foreignObject>
      </g>
      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${offset})`}>
          {showLines ? <line x2={`${xRange[1] - xRange[0]}`} stroke={VIS_GRID_COLOR} /> : null}
          <g
            key={value}
            style={{
              transform: `translate(-${labelSpacing + 10}px, -9px)`,
            }}
          >
            <foreignObject width={labelSpacing + 5} height={20}>
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
