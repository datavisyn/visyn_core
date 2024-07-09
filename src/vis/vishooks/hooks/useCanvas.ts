import * as React from 'react';
import { useSetState } from '@mantine/hooks';
import { useSetRef } from '../../../hooks/useSetRef';

export function useCanvas(props?: { ratio?: number }) {
  const [state, setState] = useSetState({
    width: 0,
    height: 0,
    context: null,
    internalObserver: null,
  });

  const scaleFactor = props?.ratio || window.devicePixelRatio;

  const { ref, setRef } = useSetRef<HTMLCanvasElement>({
    cleanup: (element) => {
      state.internalObserver?.unobserve(element);
    },
    register: (element) => {
      const observer = new ResizeObserver((entries) => {
        const newDimensions = entries[0].contentRect;

        if (element.width !== newDimensions.width || element.height !== newDimensions.height) {
          setState({ width: newDimensions.width, height: newDimensions.height });
        }
      });

      observer.observe(element);

      setState({ internalObserver: observer, context: element.getContext('2d') });
    },
  });

  return {
    width: state.width * scaleFactor,
    height: state.height * scaleFactor,
    context: state.context,
    ref,
    ratio: scaleFactor,
    setRef,
  };
}
