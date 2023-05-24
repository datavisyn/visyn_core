import { Tooltip } from '@mantine/core';
import React from 'react';

export function SingleBar({
  selectedPercent,
  x,
  width,
  y,
  height,
  tooltip,
  color = '#878E95',
  isVertical = true,
  onClick,
}: {
  selectedPercent: number | null;
  x: number;
  width: number;
  y: number;
  height: number;
  tooltip?: JSX.Element;
  color?: string;
  isVertical?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip.Floating withinPortal label={tooltip}>
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
