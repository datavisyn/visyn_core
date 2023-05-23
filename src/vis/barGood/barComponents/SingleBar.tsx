import { Tooltip } from '@mantine/core';
import React from 'react';

export function SingleBar({
  selectedPercent,
  x,
  width,
  y,
  height,
  value,
  color = '#878E95',
  isVertical = true,
  onClick,
}: {
  selectedPercent: number | null;
  x: number;
  width: number;
  y: number;
  height: number;
  value: number;
  color?: string;
  isVertical?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip.Floating withinPortal label={value}>
      <g onClick={(e) => onClick()}>
        {selectedPercent === null ? (
          <rect x={x} width={width} y={y} height={height} fill={color} />
        ) : (
          <g>
            <rect x={x} width={width} y={y} height={height} fill={color} opacity={0.5} />
            <rect
              x={x}
              width={isVertical ? width : width * selectedPercent}
              y={isVertical ? y + height - height * selectedPercent : y}
              height={isVertical ? height * selectedPercent : height}
              fill={color}
            />
          </g>
        )}
      </g>
    </Tooltip.Floating>
  );
}
