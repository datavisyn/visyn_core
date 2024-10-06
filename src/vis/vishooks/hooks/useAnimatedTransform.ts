import { useCallback, useEffect, useRef } from 'react';
import { ZoomTransform } from '../interfaces';
import { m4 } from '../math';
import { useControlledUncontrolled } from './useControlledUncontrolled';

interface UseAnimatedTransformProps {
  value?: ZoomTransform;
  onChange?: (value: ZoomTransform) => void;
  defaultValue?: ZoomTransform;
}

const linearInterpolate = (startMatrix, endMatrix, t) => {
  return startMatrix.map((startValue, index) => {
    const endValue = endMatrix[index];
    const cosT = (1 - Math.cos(t * Math.PI)) / 2;
    return startValue * (1 - cosT) + endValue * cosT;
  });
};

export function useAnimatedTransform(options: UseAnimatedTransformProps) {
  const [transform, setTransform] = useControlledUncontrolled({
    value: options.value,
    defaultValue: options.defaultValue || m4.identityMatrix4x4(),
    onChange: options.onChange,
  });

  const animationFrameRef = useRef(null);
  const previousTransformRef = useRef(options.defaultValue || m4.identityMatrix4x4());

  const setAnimatedTransform = useCallback(
    (targetTransform, duration = 0) => {
      if (duration === 0) {
        setTransform(targetTransform);
        return;
      }
      let startTime = null; // Set startTime to null initially

      const step = (currentTime) => {
        // If this is the first frame, initialize startTime to the currentTime
        if (!startTime) startTime = currentTime;

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

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    previousTransformRef.current = transform;
  }, [transform]);

  return { transform, setTransform: setAnimatedTransform, previousTransformRef };
}
