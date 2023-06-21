import * as React from 'react';
import { useSpring, animated } from 'react-spring';

export function HeatmapRect({
  x,
  y,
  width,
  height,
  color,
  setTooltipText,
  unsetTooltipText,
  setSelected,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  setTooltipText(): void;
  unsetTooltipText(): void;
  setSelected?: () => void;
}) {
  const spring = useSpring({ from: { opacity: 0 }, to: { opacity: 1 } });
  if (x < 0 || y < 0 || height < 0 || width < 0) return null;
  return (
    <animated.rect
      {...spring}
      width={width}
      height={height}
      x={x}
      y={y}
      fill={color}
      onMouseEnter={setTooltipText}
      onMouseLeave={unsetTooltipText}
      onClick={setSelected}
    />
  );
}
