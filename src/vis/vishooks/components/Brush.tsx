import * as React from 'react';
import { useId, useRef } from 'react';
import { useInteractions } from '../hooks/useInteractions';
import { clamp } from '../util';
import { Brush, Direction, Extent } from '../interfaces';

const BORDER_WIDTH = 6;
const EDGE_COLOR = 'transparent';
const MIN_BRUSH_SIZE = 8;
const BORDER_CORRECTION = 1;

interface BrushProps {
  brush: Brush;
  direction?: Direction;
  onChange?: (brush: Brush) => void;
  onChangeEnd?: (brush: Brush) => void;
  parent: React.RefObject<SVGSVGElement>;
  extent?: Extent;
  clearOnMouse?: boolean;
}

/**
 * Brush with draggable borders
 */
export function BrushRect({ parent, brush, direction = 'xy', onChange, onChangeEnd, extent, clearOnMouse = true }: BrushProps) {
  const ref = useRef(undefined);
  const id = useId();

  const callbacksRef = useRef({ onChange, onChangeEnd });
  callbacksRef.current = { onChange, onChangeEnd };

  useInteractions(ref, {
    onClick: () => {
      if (clearOnMouse) {
        callbacksRef.current.onChange?.(null);
        callbacksRef.current.onChangeEnd?.(null);
      }
    },
    onMouseUp: () => {
      callbacksRef.current.onChangeEnd?.(brush);
    },
    onDrag: (event) => {
      const bounds = parent.current.getBoundingClientRect();

      const internalExtent = extent || {
        x1: 0,
        y1: 0,
        x2: bounds.width,
        y2: bounds.height,
      };

      const relativePosition = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      const newBrush = { ...brush };

      switch (event.target.id) {
        case id: {
          const w = brush.x2 - brush.x1;
          const h = brush.y2 - brush.y1;
          newBrush.x1 = clamp(relativePosition.x - event.anchor.x, internalExtent.x1, internalExtent.x2 - w);
          newBrush.y1 = clamp(relativePosition.y - event.anchor.y, internalExtent.y1, internalExtent.y2 - h);
          newBrush.x2 = newBrush.x1 + brush.x2 - brush.x1;
          newBrush.y2 = newBrush.y1 + brush.y2 - brush.y1;
          break;
        }
        case `${id}-west`:
          newBrush.x1 = clamp(relativePosition.x, internalExtent.x1, brush.x2 - MIN_BRUSH_SIZE);
          break;
        case `${id}-ost`:
          newBrush.x2 = clamp(relativePosition.x, brush.x1 + MIN_BRUSH_SIZE, internalExtent.x2);
          break;
        case `${id}-north`:
          newBrush.y1 = clamp(relativePosition.y, internalExtent.y1, brush.y2 - MIN_BRUSH_SIZE);
          break;
        case `${id}-south`:
          newBrush.y2 = clamp(relativePosition.y, brush.y1 + MIN_BRUSH_SIZE, extent.y2);
          break;
        case `${id}-northwest`:
          newBrush.x1 = clamp(relativePosition.x, internalExtent.x1, brush.x2 - MIN_BRUSH_SIZE);
          newBrush.y1 = clamp(relativePosition.y, internalExtent.y1, brush.y2 - MIN_BRUSH_SIZE);
          break;
        case `${id}-northeast`:
          newBrush.x2 = clamp(relativePosition.x, brush.x1 + MIN_BRUSH_SIZE, extent.x2);
          newBrush.y1 = clamp(relativePosition.y, internalExtent.y1, brush.y2 - MIN_BRUSH_SIZE);
          break;
        case `${id}-southwest`:
          newBrush.x1 = clamp(relativePosition.x, internalExtent.x1, brush.x2 - MIN_BRUSH_SIZE);
          newBrush.y2 = clamp(relativePosition.y, brush.y1 + MIN_BRUSH_SIZE, extent.y2);
          break;
        case `${id}-southeast`:
          newBrush.x2 = clamp(relativePosition.x, brush.x1 + MIN_BRUSH_SIZE, extent.x2);
          newBrush.y2 = clamp(relativePosition.y, brush.y1 + MIN_BRUSH_SIZE, extent.y2);
          break;
        default:
          break;
      }

      if (newBrush.x1 !== brush.x1 || newBrush.x2 !== brush.x2 || newBrush.y1 !== brush.y1 || newBrush.y2 !== brush.y2) {
        callbacksRef.current.onChange?.(newBrush);
      }
    },
  });

  return (
    <g ref={ref}>
      <rect
        id={id}
        x={brush.x1 + BORDER_CORRECTION}
        y={brush.y1 + BORDER_CORRECTION}
        width={brush.x2 - brush.x1 - BORDER_CORRECTION * 2}
        height={brush.y2 - brush.y1 - BORDER_CORRECTION * 2}
        stroke="#24292e"
        fill="#24292e"
        fillOpacity={0.1}
        strokeDasharray={3}
        cursor="move"
      />

      {direction !== 'x' ? (
        <>
          <rect
            id={`${id}-south`}
            x={brush.x1}
            y={brush.y2 - BORDER_WIDTH / 2}
            width={brush.x2 - brush.x1}
            height={BORDER_WIDTH}
            fill={EDGE_COLOR}
            cursor="ns-resize"
          />
          <rect
            id={`${id}-north`}
            x={brush.x1}
            y={brush.y1 - BORDER_WIDTH / 2}
            width={brush.x2 - brush.x1}
            height={BORDER_WIDTH}
            fill={EDGE_COLOR}
            cursor="ns-resize"
          />
        </>
      ) : null}

      {direction !== 'y' ? (
        <>
          <rect
            id={`${id}-west`}
            x={brush.x1 - BORDER_WIDTH / 2}
            y={brush.y1}
            width={BORDER_WIDTH}
            height={brush.y2 - brush.y1}
            fill={EDGE_COLOR}
            cursor="ew-resize"
          />
          <rect
            id={`${id}-ost`}
            x={brush.x2 - BORDER_WIDTH / 2}
            y={brush.y1}
            width={BORDER_WIDTH}
            height={brush.y2 - brush.y1}
            fill={EDGE_COLOR}
            cursor="ew-resize"
          />
        </>
      ) : null}

      {direction === 'xy' ? (
        <>
          <rect
            id={`${id}-northwest`}
            x={brush.x1 - BORDER_WIDTH / 2}
            y={brush.y1 - BORDER_WIDTH / 2}
            width={BORDER_WIDTH}
            height={BORDER_WIDTH}
            cursor="nwse-resize"
            fill={EDGE_COLOR}
          />
          <rect
            id={`${id}-northeast`}
            x={brush.x2 - BORDER_WIDTH / 2}
            y={brush.y1 - BORDER_WIDTH / 2}
            width={BORDER_WIDTH}
            height={BORDER_WIDTH}
            cursor="nesw-resize"
            fill={EDGE_COLOR}
          />
          <rect
            id={`${id}-southwest`}
            x={brush.x1 - BORDER_WIDTH / 2}
            y={brush.y2 - BORDER_WIDTH / 2}
            width={BORDER_WIDTH}
            height={BORDER_WIDTH}
            cursor="nesw-resize"
            fill={EDGE_COLOR}
          />
          <rect
            id={`${id}-southeast`}
            x={brush.x2 - BORDER_WIDTH / 2}
            y={brush.y2 - BORDER_WIDTH / 2}
            width={BORDER_WIDTH}
            height={BORDER_WIDTH}
            cursor="nwse-resize"
            fill={EDGE_COLOR}
          />
        </>
      ) : null}
    </g>
  );
}
