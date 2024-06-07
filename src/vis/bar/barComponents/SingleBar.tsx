import { Tooltip } from '@mantine/core';
import React from 'react';
import { animated, useSpring, easings } from 'react-spring';
import { VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../../general/constants';
import { selectionColorDark } from '../../../utils';

export function SingleBar({
  selectedPercent,
  x,
  width,
  y,
  height,
  tooltip,
  color = VIS_NEUTRAL_COLOR,
  isVertical = true,
  onClick,
  isGroupedOrStacked = false,
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
  isGroupedOrStacked?: boolean;
}) {
  const style = useSpring({
    config: {
      duration: 500,
      easing: easings.easeOutSine,
    },
    immediate: true,
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
    immediate: true,
    to: {
      x,
      y: isVertical ? y + height - height * selectedPercent : y,
      width: isVertical ? width : width * selectedPercent,
      height: isVertical ? height * selectedPercent : height,
    },
  });

  return (
    <Tooltip.Floating label={tooltip}>
      <g onClick={(e) => onClick(e)}>
        {selectedPercent === null ? (
          <animated.rect {...style} fill={color} />
        ) : (
          <g>
            <animated.rect {...style} fill={color} opacity={VIS_UNSELECTED_OPACITY} />
            <animated.rect {...selectedRectStyle} fill={isGroupedOrStacked ? color : selectionColorDark} />
          </g>
        )}
      </g>
    </Tooltip.Floating>
  );
}
