import { range, scaleLinear } from 'd3v7';
import * as React from 'react';

export function Legend({
  xPos,
  height,
  colorScale,
  margin,
}: {
  xPos: number;
  height: number;
  colorScale: d3.ScaleLinear<string, string>;
  margin: { top: number; right: number; bottom: number; left: number };
}) {
  const legendYScale = scaleLinear().range([0, height]).domain([1, -1]);

  const getTicks = (): number[] => {
    const t = [];
    for (let i = 1.0; i >= -1.0; i -= 0.2) {
      t.push(i);
    }
    return t;
  };

  return (
    <g>
      <defs>
        <linearGradient id="myGradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={colorScale(1)} />
          <stop offset="50%" stopColor={colorScale(0)} />
          <stop offset="100%" stopColor={colorScale(-1)} />
        </linearGradient>
      </defs>
      <rect width={10} height={height} x={xPos} fill="url('#myGradient')" />
      {getTicks().map((t) => {
        return (
          <text key={`tick-${colorScale(t)}`} x={xPos + 15} y={legendYScale(t)} fontSize={12} dominantBaseline="middle" textAnchor="start">
            {t.toFixed(1)}
          </text>
        );
      })}
    </g>
  );
}
