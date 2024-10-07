import * as React from 'react';
import { ZoomTransform } from '../interfaces';
import { m4 } from '../math';
import { useControlledUncontrolled } from './useControlledUncontrolled';

interface UseAnimatedTransformProps {
  value?: ZoomTransform;
  onChange?: (value: ZoomTransform) => void;
  defaultValue?: ZoomTransform;
}

function linearInterpolate(startMatrix: ZoomTransform, endMatrix: ZoomTransform, t: number) {
  return startMatrix.map((startValue, index) => {
    const endValue = endMatrix[index];

    if (endValue === undefined) {
      throw new Error('Supplied matrices are not of the same length');
    }

    const cosT = (1 - Math.cos(t * Math.PI)) / 2;
    return startValue * (1 - cosT) + endValue * cosT;
  });
}

export function useAnimatedTransform2({ value, onIntermediate }: { value?: ZoomTransform; onIntermediate: (intermediateTransform: ZoomTransform) => void }) {
  const [state, setState] = React.useState<{
    start: ZoomTransform | undefined;
    end: ZoomTransform | undefined;
    t0: number;
  }>({
    start: undefined,
    end: value,
    t0: performance.now(),
  });

  const animationFrameRef = React.useRef<number | undefined>(undefined);

  const onIntermediateRef = React.useRef(onIntermediate);
  onIntermediateRef.current = onIntermediate;

  const requestFrame = () => {
    animationFrameRef.current = requestAnimationFrame((t1) => {
      if (state.start && state.end) {
        const t = (t1 - state.t0) / 1000;

        // End of animation
        if (t >= 1) {
          animationFrameRef.current = undefined;
          onIntermediateRef.current(state.end);
          return;
        }

        const newMatrix = linearInterpolate(state.start, state.end, t);
        onIntermediateRef.current(newMatrix);

        requestFrame();
      }
    });
  };

  // If we get a new value, set the state of this hook and start animating
  if (value !== state?.start) {
    setState({
      start: state.end,
      end: value,
      t0: performance.now(),
    });

    // eslint-disable-next-line react-compiler/react-compiler
    if (animationFrameRef.current) {
      // eslint-disable-next-line react-compiler/react-compiler
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (value && state.end) {
      // eslint-disable-next-line react-compiler/react-compiler
      requestFrame();
    }
  }

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
}

export function useAnimatedTransform(options: UseAnimatedTransformProps) {
  const [transform, setTransform] = useControlledUncontrolled({
    value: options.value,
    defaultValue: options.defaultValue || m4.identityMatrix4x4(),
    onChange: options.onChange,
  });

  const animationFrameRef = React.useRef(null);
  const previousTransformRef = React.useRef(options.defaultValue || m4.identityMatrix4x4());

  const setAnimatedTransform = React.useCallback(
    (targetTransform, duration = 0) => {
      if (duration === 0) {
        setTransform(targetTransform);
        return;
      }
      let startTime = null; // Set startTime to null initially

      const step = (currentTime) => {
        // If this is the first frame, initialize startTime to the currentTime
        if (!startTime) {
          startTime = currentTime;
        }

        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        if (progress > 0) {
          const newMatrix = linearInterpolate(previousTransformRef.current, targetTransform, progress);
          setTransform(newMatrix);
        }
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      requestAnimationFrame(step);
    },
    [setTransform],
  );

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { transform, setTransform: setAnimatedTransform, previousTransformRef };
}
