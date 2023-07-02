import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Center, Group, Text } from '@mantine/core';
import { SortTypes } from '../utils';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({
  xScale,
  yRange,
  vertPosition,
  label,
  ticks,
  showLines,
  compact = false,
  sortType,
  arrowAsc = false,
  arrowDesc = false,
  setSortType,
}: {
  showLines?: boolean;
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
  vertPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  compact?: boolean;
  sortType: SortTypes;
  arrowAsc?: boolean;
  arrowDesc?: boolean;
  setSortType: (label: string) => void;
}) {
  return (
    <>
      <g transform={`translate(${xScale.range()[1]}, ${vertPosition + 25})`}>
        <foreignObject width={Math.abs(xScale.range()[0] - xScale.range()[1])} height={20}>
          <Center>
            <Group spacing={3}>
              {arrowDesc ? <FontAwesomeIcon style={{ color: '#878E95' }} icon={faCaretLeft} /> : null}

              <Text size={compact ? 10 : 14} style={{ color: '#878E95' }} onClick={() => setSortType(label)}>
                {label}
              </Text>
              {arrowAsc ? <FontAwesomeIcon style={{ color: '#878E95' }} icon={faCaretRight} /> : null}
            </Group>
          </Center>
        </foreignObject>
      </g>
      <path transform={`translate(0, ${vertPosition})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      <path transform={`translate(0, ${yRange[0]})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />

      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${offset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" /> : null}
          <text
            key={value}
            fontSize="10px"
            textAnchor="middle"
            style={{
              transform: 'translateY(20px)',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
}
