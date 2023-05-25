import { Tooltip } from '@mantine/core';
import React from 'react';
import { animated, useSpring, easings } from 'react-spring';

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
  onClick?: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}) {
  const style = useSpring({
    config: {
      duration: 500,
      easing: easings.easeOutSine,
    },
    to: {
      x,
      y,
      width,
      height,
    },
  });

  const selectedRectStyle = useSpring({
    config: {
      duration: 500,
      easing: easings.easeOutSine,
    },
    to: {
      x,
      y: isVertical ? y + height - height * selectedPercent : y,
      width: isVertical ? width : width * selectedPercent,
      height: isVertical ? height * selectedPercent : height,
    },
  });

  return (
    <Tooltip.Floating withinPortal label={tooltip}>
      <g onClick={(e) => onClick(e)}>
        {selectedPercent === null ? (
          <animated.rect {...style} fill={color} />
        ) : (
          <g>
            <animated.rect {...style} fill={color} opacity={0.5} />
            <animated.rect {...selectedRectStyle} fill={color} />
          </g>
        )}
      </g>
    </Tooltip.Floating>
  );
}
