import { Tooltip } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSpring, animated, easings } from 'react-spring';
import { css } from '@emotion/css';
import { selectionColorDark, selectionColorDarkHovered } from '../../utils/colors';
import { NAN_REPLACEMENT } from '../general/constants';

const DELAY = 2000;
export function HeatmapRect({
  x,
  y,
  width,
  height,
  color,
  label,
  setSelected,
  xOrder = 1,
  yOrder = 1,
  isSelected = false,
  isImmediate = false,
  onClick = () => null,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: number;
  setSelected?: () => void;
  xOrder?: number;
  yOrder?: number;
  isSelected?: boolean;
  isImmediate?: boolean;
  onClick?: (e: any) => void;
}) {
  const [isHovered, setIsHovered] = useState<boolean>();
  const currXOrder = useRef(xOrder);
  const currYOrder = useRef(yOrder);

  isImmediate = isImmediate || (currXOrder.current === xOrder && currYOrder.current === yOrder);

  const colorSpring = useSpring({ fill: color, config: { duration: 750, easing: easings.easeInOutSine } });

  const xSpring = useSpring({
    x,
    config: { duration: DELAY, easing: easings.easeInOutSine },
    delay: isImmediate ? 0 : DELAY * xOrder,
    immediate: isImmediate,
  });
  const ySpring = useSpring({
    y,
    config: { duration: DELAY, easing: easings.easeInOutSine },
    delay: isImmediate ? 0 : DELAY * yOrder,
    immediate: isImmediate,
  });

  const rect = useMemo(() => {
    return (
      <animated.rect
        className={css`
          &:hover {
            stroke: ${selectionColorDarkHovered};
          }
        `}
        {...colorSpring}
        {...xSpring}
        {...ySpring}
        width={width}
        stroke={isSelected ? selectionColorDark : 'none'}
        strokeWidth={3}
        height={height}
        onMouseEnter={() => {
          if (xSpring.x.isAnimating || ySpring.y.isAnimating) {
            return;
          }
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (xSpring.x.isAnimating || ySpring.y.isAnimating) {
            return;
          }
          setIsHovered(false);
        }}
        onMouseDown={(e) => {
          if (xSpring.x.isAnimating || ySpring.y.isAnimating) {
            return;
          }

          setSelected();
          onClick(e);
        }}
      />
    );
  }, [colorSpring, height, isSelected, onClick, setSelected, width, xSpring, ySpring]);

  useEffect(() => {
    currXOrder.current = xOrder;
    currYOrder.current = yOrder;
  }, [xOrder, yOrder]);

  const formatter = useMemo(() => {
    return d3.format('.3s');
  }, []);

  return isHovered ? (
    <Tooltip withArrow arrowSize={6} label={label === null ? NAN_REPLACEMENT : formatter(label)}>
      {rect}
    </Tooltip>
  ) : (
    rect
  );
}
