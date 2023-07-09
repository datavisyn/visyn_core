import { Group, useMantineTheme, Text, Tooltip, Stack } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';
import * as d3 from 'd3v7';
import { ECorrelationPlotMode, ICorrelationConfig } from '../../interfaces';

const marginRect = { top: 4, right: 4, bottom: 4, left: 4 };

export interface CorrelationPairProps {
  xi: number;
  yi: number;
  cxLT: number;
  cyLT: number;
  cxUT: number;
  cyUT: number;
  correlation: number;
  tStatistic: number;
  pValue: number;
  xName: string;
  yName: string;
  radius: number;
}

export function CorrelationPair({
  value,
  fill,
  boundingRect,
  config,
}: {
  value: CorrelationPairProps;
  fill: string;
  boundingRect: { width: number; height: number };
  config: ICorrelationConfig;
}) {
  const [isHover, setIsHover] = React.useState(false);
  const theme = useMantineTheme();
  const hoverColor = theme.colors.gray[1];

  const format = useMemo(() => {
    return d3.format('e');
  }, []);

  const correlationFormat = useMemo(() => {
    return d3.format('.3e');
  }, []);

  const topRect = useMemo(() => {
    return (
      <g>
        <rect
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
          x={value.cxUT - boundingRect.width / 2 + marginRect.left}
          y={value.cyUT - boundingRect.height / 2 + marginRect.top}
          fill={isHover || (config.highlightSignificant && value.pValue < 0.05) ? hoverColor : 'transparent'}
        />
        <circle cx={value.cxUT} cy={value.cyUT} r={value.radius} fill={fill} />
      </g>
    );
  }, [boundingRect.height, boundingRect.width, config.highlightSignificant, fill, hoverColor, isHover, value]);

  const bottomRect = useMemo(() => {
    return (
      <g>
        <rect
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
          x={value.cxLT - boundingRect.width / 2 + marginRect.left}
          y={value.cyLT - boundingRect.height / 2 + marginRect.top}
          fill={isHover || (config.highlightSignificant && value.pValue < 0.05) ? hoverColor : 'transparent'}
        />
        <text x={value.cxLT} y={value.cyLT} dominantBaseline="middle" textAnchor="middle" fontWeight="bold" fill="black">
          {config.mode === ECorrelationPlotMode.CORRELATION ? value.correlation.toFixed(2) : value.pValue < 0.001 ? '< 0.001' : value.pValue.toFixed(3)}
        </text>
      </g>
    );
  }, [boundingRect.height, boundingRect.width, config.highlightSignificant, config.mode, hoverColor, isHover, value]);

  const label = useMemo(() => {
    return (
      <Stack>
        <Group>
          {`${value.xName}`}
          <Text>&#x27F6;</Text>
          {`${value.yName}`}
        </Group>
        <Text>Correlation: {correlationFormat(value.correlation)}</Text>
        <Text>P-value: {format(value.pValue)}</Text>
      </Stack>
    );
  }, [correlationFormat, format, value]);

  return (
    <g onMouseEnter={() => setIsHover(true)} onMouseOut={() => setIsHover(false)}>
      {isHover ? (
        <Tooltip withinPortal label={label}>
          {topRect}
        </Tooltip>
      ) : (
        topRect
      )}
      {isHover ? (
        <Tooltip withinPortal label={label}>
          {bottomRect}
        </Tooltip>
      ) : (
        bottomRect
      )}
    </g>
  );
}
