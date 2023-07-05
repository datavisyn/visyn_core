import * as d3 from 'd3v7';
import * as React from 'react';
import { AnimatedLine } from './AnimatedLine';
import { AnimatedText } from './AnimatedText';

export function HeatmapText({
  margin,
  yScale,
  xScale,
  width,
  rectHeight,
  height,
  rectWidth,
}: {
  margin: { top: number; right: number; bottom: number; left: number };
  yScale: d3.ScaleBand<string>;
  xScale: d3.ScaleBand<string>;
  width: number;
  height: number;
  rectHeight: number;
  rectWidth: number;
}) {
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = React.useState<string | null>(null);

  return (
    <g>
      {xScale.domain().map((xVal, i) => (
        <g
          style={{ textAlign: 'center', dominantBaseline: 'central' }}
          key={xVal}
          onMouseEnter={() => setHoveredColumn(xVal)}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          <AnimatedLine
            x1={xScale(xVal) + rectWidth + margin.left}
            x2={xScale(xVal) + rectWidth + margin.left}
            y1={margin.top}
            y2={height - margin.bottom}
            order={1 - i / xScale.domain().length}
          />
          <AnimatedLine
            x1={xScale(xVal) + margin.left}
            x2={xScale(xVal) + margin.left}
            y1={margin.top}
            y2={height - margin.bottom}
            order={1 - i / xScale.domain().length}
          />
          <AnimatedText
            x={xScale(xVal) + rectWidth / 2 + margin.left}
            y={height - margin.bottom + 15}
            order={1 - i / xScale.domain().length}
            bold={xVal === hoveredColumn}
          >
            {xVal}
          </AnimatedText>
        </g>
      ))}
      {yScale.domain().map((yVal, i) => (
        <g key={yVal} onMouseEnter={() => setHoveredRow(yVal)} onMouseLeave={() => setHoveredRow(null)}>
          <AnimatedLine
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(yVal) + rectHeight + margin.top}
            y2={yScale(yVal) + rectHeight + margin.top}
            order={i / yScale.domain().length}
          />
          <AnimatedLine
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(yVal) + margin.top}
            y2={yScale(yVal) + margin.top}
            order={i / yScale.domain().length}
          />
          <AnimatedText x={0} y={yScale(yVal) + rectHeight / 2 + margin.top} order={i / yScale.domain().length} bold={yVal === hoveredRow}>
            {yVal}
          </AnimatedText>
        </g>
      ))}
    </g>
  );
}
