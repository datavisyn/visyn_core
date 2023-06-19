import * as React from 'react';
import * as d3 from 'd3v7';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Center, Group } from '@mantine/core';

// code taken from https://wattenberger.com/blog/react-and-d3
export function CorrelationPlotXAxis({ xScale, ticks }: { xScale: d3.ScaleBand<string>; ticks: { value: string; offset: number }[] }) {
  console.log(ticks);
  return (
    <>
      {ticks.map(({ value, offset }) => (
        <g key={value}>
          {/* <line y2="6" stroke="currentColor" /> */}
          <text
            x={xScale(value) + xScale.bandwidth() / 2}
            y={0}
            transform="rotate(45)"
            key={value}
            fontSize="10px"
            textAnchor="middle"
            // style={{
            //   transform: 'translateY(20px)',
            // }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
}
