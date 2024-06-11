import { RefObject, useRef } from 'react';
import { produce } from 'immer';
import { useInteractions } from './useInteractions';
import { clamp } from '../util';
import { useControlledUncontrolled } from './useControlledUncontrolled';

export type LassoValue = { x: number; y: number }[];

export interface LassoEvent {
  lasso: LassoValue;
  isFirstDrag: boolean;
  isLastDrag: boolean;
}

export function lassoToSvgPath(lasso: { x: number; y: number }[]) {
  return lasso
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');
}

export interface LassoProps {
  value?: LassoValue;
  onChange?: (points: LassoValue) => void;
  onChangeEnd?: (points: LassoValue) => void;
  minDistanceToCreatePoint?: number;
  skip?: boolean;
}

export function checkForInclusion(lasso: LassoValue, point: { x: number; y: number }) {
  let numberOfIntersections = 0;

  for (let i = 0, j = lasso.length - 1; i < lasso.length; j = i++) {
    const { x: prevX, y: prevY } = lasso[j];
    const { x, y } = lasso[i];

    if (y > point.y !== prevY > point.y && point.x < ((prevX - x) * (point.y - y)) / (prevY - y) + x) {
      numberOfIntersections++;
    }
  }

  return numberOfIntersections % 2 !== 0;
}

export function useLasso(ref: RefObject<HTMLElement>, options: LassoProps = {}) {
  const lastXY = useRef<{ x: number; y: number }>();

  const { value, onChange } = options;

  const [internalValue, setInternalValue] = useControlledUncontrolled({
    value,
    onChange,
  });

  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useInteractions(ref, {
    skip: options.skip,
    onDrag: (event) => {
      const bounds = ref.current.getBoundingClientRect();

      if (event.isFirstDrag) {
        const newLasso = [event.start, event.end];
        setInternalValue(newLasso);
        lastXY.current = event.end;
        callbacksRef.current.onChange?.(newLasso);
      } else if (Math.abs(event.end.x - lastXY.current.x) + Math.abs(event.end.y - lastXY.current.y) > (options.minDistanceToCreatePoint ?? 6)) {
        const newPoint = {
          x: clamp(event.end.x, 1, bounds.width - 1),
          y: clamp(event.end.y, 1, bounds.height - 1),
        };

        const newLasso = produce(internalValue, (draft) => {
          draft.push(newPoint);
        });
        setInternalValue(newLasso);
        lastXY.current = newPoint;

        callbacksRef.current.onChange?.(newLasso);
      }
    },
    onClick: () => {
      callbacksRef.current.onChange?.(undefined);
      callbacksRef.current.onChangeEnd?.(undefined);
    },
    onMouseUp: () => {
      callbacksRef.current.onChangeEnd?.(internalValue);
      setInternalValue(undefined);
      lastXY.current = undefined;

      callbacksRef.current.onChange?.(undefined);
    },
  });

  return { value: internalValue, setValue: setInternalValue };
}
