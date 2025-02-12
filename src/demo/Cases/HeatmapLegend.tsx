/* eslint-disable @typescript-eslint/no-shadow */
import * as React from 'react';

const SIZE = 120;

export function HeatmapLegend({ n, scale }: { n: number; scale: any }) {
  const w = SIZE / n;

  const valueDomain = scale.quantize().valueDomain() as number[];
  const uncertaintyDomain = scale.quantize().uncertaintyDomain() as number[];
  const data = scale.quantize().data();

  const valueStart = valueDomain[0]!;
  const uncertaintyStart = uncertaintyDomain[0]!;
  const valueStep = (valueDomain[1]! - valueDomain[0]!) / data.length;
  const uncertaintyStep = (uncertaintyDomain[1]! - uncertaintyDomain[0]!) / data[0].length;

  const offsetX = 16;
  const offsetY = 50;

  return (
    <svg width={180} height={180}>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {Array.from({ length: n }).map((_, x) => {
          return Array.from({ length: n }).map((_, y) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <rect key={`${x}${y}`} x={x * w} y={y * w} width={w} height={w} fill={scale(data[data.length - y - 1][x].v, data[data.length - y - 1][x].u)} />
            );
          });
        })}

        {Array.from({ length: n + 1 }).map((_, x) => {
          return (
            <>
              <text x={x * w} y={-10} fontSize={10} textAnchor="middle" dominantBaseline="middle">
                {parseFloat((valueStart + valueStep * x).toFixed(2))}
              </text>
              <line x1={x * w} y1={0} x2={x * w} y2={-4} stroke="black" />
            </>
          );
        })}

        {Array.from({ length: n + 1 }).map((_, y) => {
          return (
            <>
              <text x={SIZE + 10} y={y * w} fontSize={10} textAnchor="left" dominantBaseline="middle">
                {parseFloat((uncertaintyStart + uncertaintyStep * y).toFixed(2))}
              </text>
              <line x1={SIZE} y1={y * w} x2={SIZE + 4} y2={y * w} stroke="black" />
            </>
          );
        })}

        <line x1={0} y1={0} x2={SIZE} y2={0} stroke="black" />
        <line x1={SIZE} y1={0} x2={SIZE} y2={SIZE} stroke="black" />

        <text x={SIZE / 2} y={-28} fontSize={12} textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
          Value
        </text>

        <text
          x={SIZE + 35}
          y={SIZE / 2}
          fontSize={12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="bold"
          transform={`rotate(90, ${SIZE + 35}, ${SIZE / 2})`}
        >
          Uncertainty
        </text>
      </g>
    </svg>
  );
}