import { RefObject, useRef } from 'react';
import { useInteractions } from './useInteractions';
import { Brush, Direction, Extent, PersistMode } from '../interfaces';
import { clamp } from '../util';
import { useControlledUncontrolled } from './useControlledUncontrolled';

interface UseBrushProps {
  value?: Brush;
  onChange?: (brush: Brush) => void;
  onChangeEnd?: (brush: Brush) => void;
  onClick?: () => void;
  defaultValue?: Brush;
  direction?: Direction;
  extent?: Extent;
  persistMode?: PersistMode;
}

export function useBrush(ref: RefObject<HTMLElement>, options: UseBrushProps = {}) {
  const [brush, setBrush] = useControlledUncontrolled({
    value: options.value,
    onChange: options.onChange,
    defaultValue: options.defaultValue,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useInteractions(ref, {
    moveTarget: 'overlay',
    extent: options.extent,
    onClick: optionsRef.current.onClick,
    onDrag: (event) => {
      const bounds = ref.current.getBoundingClientRect();

      const extent = optionsRef.current.extent || {
        x1: 0,
        y1: 0,
        x2: bounds.width,
        y2: bounds.height,
      };

      const newBrush = {
        x1: Math.min(event.anchor.x, event.end.x),
        y1: Math.min(event.anchor.y, event.end.y),
        x2: Math.max(event.anchor.x, event.end.x),
        y2: Math.max(event.anchor.y, event.end.y),
      };

      if (options.direction === 'x') {
        newBrush.y1 = 0;
        newBrush.y2 = bounds.height;
      } else if (options.direction === 'y') {
        newBrush.x1 = 0;
        newBrush.x2 = bounds.width;
      }

      newBrush.x1 = clamp(newBrush.x1, extent.x1, extent.x2);
      newBrush.y1 = clamp(newBrush.y1, extent.y1, extent.y2);
      newBrush.x2 = clamp(newBrush.x2, extent.x1, extent.x2);
      newBrush.y2 = clamp(newBrush.y2, extent.y1, extent.y2);

      setBrush(newBrush);

      optionsRef.current.onChange?.(newBrush);
    },
    onMouseUp: () => {
      optionsRef.current.onChangeEnd?.(brush);

      if (optionsRef.current.persistMode === 'clear_on_mouse_up') {
        setBrush(undefined);
      }
    },
  });

  return { brush, setBrush };
}
