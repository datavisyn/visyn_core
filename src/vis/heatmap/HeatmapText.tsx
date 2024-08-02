import * as d3 from 'd3v7';
import * as React from 'react';
import { Text, Tooltip, Center, Stack } from '@mantine/core';
import { useMemo } from 'react';
import { AnimatedLine } from './AnimatedLine';
import { AnimatedText } from './AnimatedText';
import { NAN_REPLACEMENT, VIS_LABEL_COLOR, VIS_TICK_LABEL_SIZE } from '../general/constants';

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
    const maxLabelLength = d3.max(yScale.domain().map((m) => m?.length));

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
            <Center>
              <Tooltip withinPortal withArrow arrowSize={6} label={xVal ?? NAN_REPLACEMENT}>
                <Text
                  data-testid={`XAxisLabel${i}`}
                  pb={2} // to make sure the text is not cut off, e.g. "g"s
                  size={`${VIS_TICK_LABEL_SIZE}px`}
                  c={VIS_LABEL_COLOR}
                  style={{ textOverflow: 'ellipsis', userSelect: 'none', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {xVal || NAN_REPLACEMENT}
                </Text>
              </Tooltip>
            </Center>
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
            <Stack justify="center" h="100%">
              <Tooltip withinPortal withArrow arrowSize={6} label={yVal ?? NAN_REPLACEMENT}>
                <Text
                  data-testid={`YAxisLabel${i}`}
                  size={`${VIS_TICK_LABEL_SIZE}px`}
                  c={VIS_LABEL_COLOR}
                  lh="xs"
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', userSelect: 'none' }}
                >
                  {yVal || NAN_REPLACEMENT}
                </Text>
              </Tooltip>
            </Stack>
          </AnimatedText>
        </g>
      ))}
    </g>
  );
}
