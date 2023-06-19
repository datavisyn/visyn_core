import * as React from 'react';

const padding = { top: 16, right: 16, bottom: 16, left: 16 };

export interface CorrelationPairProps {
  cx: number;
  cy: number;
  correlation: number;
  pValue: number;
  xName: string;
  yName: string;
}

export function CircleCorrelationPair({ value, fill, hover }: { value: CorrelationPairProps; fill: string; hover: boolean }) {
  return null;
  // const cx = xScale(value.xname) + xScale.bandwidth() / 2;
  // const cy = yScale(value.yname) + yScale.bandwidth() / 2;

  // return (
  //   <>
  //     <circle
  //       cx={cx}
  //       cy={cy}
  //       r={Math.min(xScale.bandwidth() / 2 - padding.left, yScale.bandwidth() / 2 - padding.top)}
  //       fill={fill}
  //       {...(hover ? { stroke: 'black', strokeWidth: 3 } : {})}
  //     />
  //     <text
  //       x={xScale(value.yname) + xScale.bandwidth() / 2}
  //       y={yScale(value.xname) + yScale.bandwidth() / 2}
  //       fontSize={24}
  //       dominantBaseline="middle"
  //       textAnchor="middle"
  //       fontWeight={hover ? 'bold' : 'initial'}
  //     >
  //       {value.correlation.toFixed(2)}
  //     </text>
  //   </>
  // );
}
