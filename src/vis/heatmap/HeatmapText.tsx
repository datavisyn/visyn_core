import * as d3 from 'd3v7';
import * as React from 'react';
import { Group, Text, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
import { AnimatedLine } from './AnimatedLine';
import { AnimatedText } from './AnimatedText';

const textMargin = 2;
export function HeatmapText({
  margin,
  yScale,
  xScale,
  width,
  rectHeight,
  height,
  rectWidth,
  isImmediate,
}: {
  margin: { top: number; right: number; bottom: number; left: number };
  yScale: d3.ScaleBand<string>;
  xScale: d3.ScaleBand<string>;
  width: number;
  height: number;
  rectHeight: number;
  rectWidth: number;
  isImmediate: boolean;
}) {
  const labelSpacing = useMemo(() => {
    const maxLabelLength = d3.max(yScale.domain().map((m) => m.length));

    return maxLabelLength > 5 ? 35 : maxLabelLength * 7;
  }, [yScale]);

  return (
    <g>
      {xScale.domain().map((xVal, i) => (
        <g style={{ textAlign: 'center', dominantBaseline: 'central' }} key={xVal}>
          <AnimatedLine
            x1={xScale(xVal) + rectWidth + margin.left}
            x2={xScale(xVal) + rectWidth + margin.left}
            y1={margin.top}
            y2={height - margin.bottom}
            order={1 - i / xScale.domain().length}
            setImmediate={isImmediate}
          />
          <AnimatedLine
            x1={xScale(xVal) + margin.left}
            x2={xScale(xVal) + margin.left}
            y1={margin.top}
            y2={height - margin.bottom}
            order={1 - i / xScale.domain().length}
            setImmediate={isImmediate}
          />
          <AnimatedText
            x={xScale(xVal) + margin.left + textMargin}
            width={xScale.bandwidth() - textMargin * 2}
            height={20}
            y={height - margin.bottom + 8}
            order={1 - i / xScale.domain().length}
            setImmediate={isImmediate}
          >
            <Tooltip withinPortal withArrow arrowSize={6} label={xVal}>
              <Text size="xs" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {xVal}
              </Text>
            </Tooltip>
          </AnimatedText>
        </g>
      ))}
      {yScale.domain().map((yVal, i) => (
        <g key={yVal}>
          <AnimatedLine
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(yVal) + rectHeight + margin.top}
            y2={yScale(yVal) + rectHeight + margin.top}
            order={i / yScale.domain().length}
            setImmediate={isImmediate}
          />
          <AnimatedLine
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(yVal) + margin.top}
            y2={yScale(yVal) + margin.top}
            order={i / yScale.domain().length}
            setImmediate={isImmediate}
          />
          <AnimatedText
            x={35 - labelSpacing}
            y={yScale(yVal) + margin.top}
            order={i / yScale.domain().length}
            height={yScale.bandwidth()}
            width={labelSpacing}
            setImmediate={isImmediate}
          >
            <Tooltip withinPortal withArrow arrowSize={6} label={yVal}>
              <Group style={{ width: '100%', height: '100%' }} justify="right">
                <Text size="xs" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
