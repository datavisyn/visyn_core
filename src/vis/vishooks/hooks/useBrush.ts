import { useRef } from 'react';
import { UseInteractionsProps, useInteractions } from './useInteractions';
import { Brush, Direction, Extent, PersistMode } from '../interfaces';
import { clamp } from '../util';
import { useControlledUncontrolled } from './useControlledUncontrolled';

interface UseBrushProps {
  value?: Brush;
  onChange?: (brush: Brush | undefined) => void;
  onChangeEnd?: (brush: Brush | undefined, nativeEvent: Parameters<NonNullable<UseInteractionsProps['onClick']>>[0]) => void;
  onClick?: NonNullable<UseInteractionsProps['onClick']>;
  defaultValue?: Brush;
  direction?: Direction;
  extent?: Extent;
  persistMode?: PersistMode;
  skip?: boolean;
  moveTarget?: 'overlay' | 'window';
}

export function useBrush(options: UseBrushProps = {}) {
  const [internalValue, setInternalValue] = useControlledUncontrolled<Brush | undefined>({
    value: options.value,
    onChange: options.onChange,
    defaultValue: options.defaultValue,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { ref, setRef, state } = useInteractions({
    moveTarget: options.moveTarget,
    skip: options.skip,
    extent: options.extent,
    onClick: optionsRef.current.onClick,
    onDrag: (event) => {
      const bounds = event.target.getBoundingClientRect();

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

      setInternalValue(newBrush);

      optionsRef.current.onChange?.(newBrush);
    },
    onMouseUp: (event) => {
      optionsRef.current.onChangeEnd?.(internalValue, event);

      if (optionsRef.current.persistMode === 'clear_on_mouse_up') {
        setInternalValue(undefined);
      }
    },
  });

  return { ref, setRef, value: internalValue, setValue: setInternalValue, state };
}
