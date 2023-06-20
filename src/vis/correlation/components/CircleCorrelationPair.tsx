import { useMantineTheme } from '@mantine/core';
import * as React from 'react';

export interface CorrelationPairProps {
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
}: {
  value: CorrelationPairProps;
  fill: string;
  boundingRect: { width: number; height: number };
}) {
  const [hovered, setHovered] = React.useState(false);
  const theme = useMantineTheme();
  const hoverColor = theme.colors.gray[2];

  return (
    <g>
      <rect
        width={boundingRect.width}
        height={boundingRect.height}
        x={value.cxUT - boundingRect.width / 2}
        y={value.cyUT - boundingRect.height / 2}
        fill={hovered ? hoverColor : 'transparent'}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <circle cx={value.cxUT} cy={value.cyUT} r={value.radius} fill={fill} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} />
      <rect
        width={boundingRect.width}
        height={boundingRect.height}
        x={value.cxLT - boundingRect.width / 2}
        y={value.cyLT - boundingRect.height / 2}
        fill={hovered ? hoverColor : 'transparent'}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <text x={value.cxLT} y={value.cyLT} fontSize={24} dominantBaseline="middle" textAnchor="middle">
        {value.correlation.toFixed(2)}
      </text>
    </g>
  );
}
