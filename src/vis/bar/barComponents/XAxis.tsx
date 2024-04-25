import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Center, Group, Text, Tooltip, rem } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { SortTypes } from '../interfaces';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({
  arrowAsc = false,
  arrowDesc = false,
  compact = false,
  label,
  setSortType,
  shouldRotate = false,
  showLines,
  sortType,
  ticks = [],
  vertPosition,
  xScale,
  yRange,
}: {
  arrowAsc?: boolean;
  arrowDesc?: boolean;
  compact?: boolean;
  label: string;
  setSortType: (label: string) => void;
  shouldRotate?: boolean;
  showLines?: boolean;
  sortType: SortTypes;
  ticks: { value: string | number; offset: number }[];
  vertPosition: number;
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
}) {
  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].offset - ticks[0].offset);
    }

    return xScale.range()[0] - xScale.range()[1];
  }, [ticks, xScale]);
  return (
    <>
      <g transform={`translate(${xScale.range()[1]}, ${vertPosition + 25})`}>
        <foreignObject width={Math.abs(xScale.range()[0] - xScale.range()[1])} height={20}>
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
      <path transform={`translate(0, ${vertPosition})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      <path transform={`translate(0, ${yRange[0]})`} d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />

      {ticks.map(({ value, offset }) => (
        <g key={value} transform={`translate(${offset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          {showLines ? <line y2={`${-(yRange[1] - yRange[0])}`} stroke="lightgray" /> : null}
          <foreignObject x={0 - tickWidth / 2} y={10} width={tickWidth} height={20}>
            <Center>
              <Tooltip withinPortal label={value}>
                <Text
                  px={2}
                  size={rem('10px')}
                  style={{
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transform: `translate(0px, 2px) rotate(${shouldRotate ? '-45deg' : '0deg'})`,
                  }}
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
