import { useMantineTheme } from '@mantine/core';
import * as React from 'react';
import { ECorrelationPlotMode, ICorrelationConfig } from '../../interfaces';

const marginRect = { top: 3, right: 3, bottom: 3, left: 3 };

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
  config,
}: {
  value: CorrelationPairProps;
  fill: string;
  boundingRect: { width: number; height: number };
  hover: boolean;
  setHovered: ({ x, y }: { x: number; y: number }) => void;
  config: ICorrelationConfig;
}) {
  const theme = useMantineTheme();
  const hoverColor = theme.colors.gray[2];

  return (
    <g>
      <g onMouseEnter={() => setHovered({ x: value.xi, y: value.yi })} onMouseLeave={() => setHovered(null)}>
        {' '}
        <rect
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
          x={value.cxUT - boundingRect.width / 2 + marginRect.left}
          y={value.cyUT - boundingRect.height / 2 + marginRect.top}
          fill={hover || (config.highlightSignificant && value.pValue < 0.05) ? hoverColor : 'transparent'}
        />
        <circle cx={value.cxUT} cy={value.cyUT} r={value.radius} fill={fill} />
      </g>
      <g onMouseEnter={() => setHovered({ x: value.yi, y: value.xi })} onMouseLeave={() => setHovered(null)}>
        <rect
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
          x={value.cxLT - boundingRect.width / 2 + marginRect.left}
          y={value.cyLT - boundingRect.height / 2 + marginRect.top}
          fill={hover || (config.highlightSignificant && value.pValue < 0.05) ? hoverColor : 'transparent'}
        />
        <text x={value.cxLT} y={value.cyLT} dominantBaseline="middle" textAnchor="middle" fontWeight="bold" fill={fill}>
          {config.mode === ECorrelationPlotMode.CORRELATION ? value.correlation.toFixed(2) : value.pValue < 0.001 ? '< 0.001' : value.pValue.toFixed(3)}
        </text>
      </g>
    </g>
  );
}