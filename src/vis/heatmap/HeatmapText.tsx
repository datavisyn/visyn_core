import * as d3 from 'd3v7';
import * as React from 'react';
import { Group, Text, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
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

  const labelSpacing = useMemo(() => {
    const maxLabelLength = d3.max(yScale.domain().map((m) => m.length));

    return maxLabelLength > 5 ? 35 : maxLabelLength * 7;
  }, [yScale]);

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
            x={xScale(xVal) + margin.left}
            width={xScale.bandwidth()}
            height={20}
            y={height - margin.bottom + 8}
            order={1 - i / xScale.domain().length}
            bold={xVal === hoveredColumn}
          >
            <Tooltip withinPortal withArrow arrowSize={6} label={xVal}>
              <Text size={12} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {xVal}
              </Text>
            </Tooltip>
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
          <AnimatedText
            x={30 - labelSpacing}
            y={yScale(yVal) + margin.top}
            order={i / yScale.domain().length}
            bold={yVal === hoveredRow}
            height={yScale.bandwidth()}
            width={labelSpacing}
          >
            <Tooltip withinPortal withArrow arrowSize={6} label={yVal}>
              <Group style={{ width: '100%', height: '100%' }} position="right">
                <Text size={12} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {yVal}
                </Text>
              </Group>
            </Tooltip>
          </AnimatedText>
        </g>
      ))}
    </g>
  );
}
