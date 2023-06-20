import { useMantineTheme } from '@mantine/core';
import * as React from 'react';

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

export function CircleCorrelationPair({
  value,
  fill,
  boundingRect,
  hover,
  setHovered,
}: {
  value: CorrelationPairProps;
  fill: string;
  boundingRect: { width: number; height: number };
  hover: boolean;
  setHovered: ({ x, y }: { x: number; y: number }) => void;
}) {
  const theme = useMantineTheme();
  const hoverColor = theme.colors.gray[2];

  return (
    <g>
      <g onMouseEnter={() => setHovered({ x: value.xi, y: value.yi })} onMouseLeave={() => setHovered(null)}>
        {' '}
        <rect
          width={boundingRect.width}
          height={boundingRect.height}
          x={value.cxUT - boundingRect.width / 2}
          y={value.cyUT - boundingRect.height / 2}
          fill={hover ? hoverColor : 'transparent'}
        />
        <circle cx={value.cxUT} cy={value.cyUT} r={value.radius} fill={fill} />
      </g>
      <g onMouseEnter={() => setHovered({ x: value.yi, y: value.xi })} onMouseLeave={() => setHovered(null)}>
        <rect
          width={boundingRect.width}
          height={boundingRect.height}
          x={value.cxLT - boundingRect.width / 2}
          y={value.cyLT - boundingRect.height / 2}
          fill={hover ? hoverColor : 'transparent'}
        />
        <text x={value.cxLT} y={value.cyLT} dominantBaseline="middle" textAnchor="middle">
          {value.correlation.toFixed(2)}
        </text>
      </g>
    </g>
  );
}
