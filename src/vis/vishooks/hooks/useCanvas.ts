import * as React from 'react';
import { useSetState } from '@mantine/hooks';
import { useSetRef } from '../../../hooks/useSetRef';

export function useCanvas<ContextId extends '2d' | 'webgl' | 'bitmaprenderer' | 'webgl2' = '2d'>(props?: { ratio?: number; contextId?: ContextId }) {
  const [state, setState] = useSetState({
    width: 0,
    height: 0,
    context: null as ContextId extends '2d'
      ? CanvasRenderingContext2D
      : ContextId extends 'webgl'
        ? WebGLRenderingContext
        : ContextId extends 'bitmaprenderer'
          ? ImageBitmapRenderingContext
          : ContextId extends 'webgl2'
            ? WebGL2RenderingContext
            : null,
    internalObserver: undefined as ResizeObserver | undefined,
  });

  const scaleFactor = props?.ratio || window.devicePixelRatio;

  const { ref, setRef } = useSetRef<HTMLCanvasElement>({
    cleanup: (element) => {
      state.internalObserver?.unobserve(element);
    },
    register: (element) => {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          const newDimensions = entries[0].contentRect;

          setState((previous) => {
            if (previous.width === newDimensions.width && previous.height === newDimensions.height && previous.context) {
              return previous;
            }

            return {
              width: newDimensions.width,
              height: newDimensions.height,
              context: previous.context ? previous.context : (element.getContext(props?.contextId ?? '2d') as any),
            };
          });
        }
      });

      observer.observe(element);

      setState({ internalObserver: observer });
    },
  });

  return {
    // Real measured dimensions
    contentWidth: state.width,
    contentHeight: state.height,

    // Suggested dimensions for the canvas
    width: state.width * scaleFactor,
    height: state.height * scaleFactor,

    context: state.context,
    ratio: scaleFactor,
    setRef,
    ref,
  };
}
