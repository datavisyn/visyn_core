import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Center, Group, Text, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { SortTypes } from '../interfaces';

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
  arrowAsc = false,
  arrowDesc = false,
  sortType,
  setSortType,
}: {
  yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  xRange: [number, number];
  horizontalPosition: number;
  label: string;
  ticks: { value: string | number; offset: number }[];
  showLines?: boolean;
  compact?: boolean;
  arrowAsc?: boolean;
  arrowDesc?: boolean;
  sortType: SortTypes;
  setSortType: (label: string) => void;
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
            <Group gap={3} style={{ cursor: 'pointer' }}>
              {arrowDesc ? <FontAwesomeIcon style={{ color: '#878E95' }} icon={faCaretLeft} /> : null}

              <Text size={compact ? rem('10px') : 'sm'} style={{ color: '#878E95' }} onClick={() => setSortType(label)}>
                {label}
              </Text>
              {arrowAsc ? <FontAwesomeIcon style={{ color: '#878E95' }} icon={faCaretRight} /> : null}
            </Group>
          </Center>
        </foreignObject>
      </g>
      <path
        transform={`translate(${horizontalPosition}, 0)`}
        d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')}
        fill="none"
        stroke="lightgray"
      />
      <path transform={`translate(${xRange[1]}, 0)`} d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${offset})`}>
          <line x2="-6" stroke="currentColor" />
          {showLines ? <line x2={`${xRange[1] - xRange[0]}`} stroke="lightgray" /> : null}
          <g
            key={value}
            style={{
              transform: `translate(-${labelSpacing + 10}px, -9px)`,
            }}
          >
            <foreignObject width={labelSpacing} height={20}>
              <Group style={{ width: '100%', height: '100%' }} justify="right">
                <Text truncate size={rem('10px')}>
                  {value}
                </Text>
              </Group>
            </foreignObject>
          </g>
        </g>
      ))}
    </>
  );
}
