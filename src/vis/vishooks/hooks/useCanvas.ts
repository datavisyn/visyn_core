import * as React from 'react';
import { useSetState } from '@mantine/hooks';
import { useSetRef } from '../../../hooks/useSetRef';

export function useCanvas<ContextId extends '2d' | 'webgl' | 'bitmaprenderer' | 'webgl2' = '2d'>(props?: { ratio?: number; contextId?: ContextId }) {
  const [state, setState] = useSetState({
    width: 0,
    height: 0,
    pixelContentWidth: 0,
    pixelContentHeight: 0,
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
        const entry = entries[0];

        if (entry) {
          const newDimensions = entry.contentRect;

          let pixelContentWidth = 0;
          let pixelContentHeight = 0;

          if ('devicePixelContentBoxSize' in entry && entry.devicePixelContentBoxSize?.[0]) {
            // Feature is present
            const { inlineSize, blockSize } = entry.devicePixelContentBoxSize[0];

            pixelContentWidth = inlineSize;
            pixelContentHeight = blockSize;
          } else {
            // Feature is not supported, round the canvas pixel buffer to an integer value that most likely snaps to the physical pixels
            pixelContentWidth = Math.round(newDimensions.width * scaleFactor);
            pixelContentHeight = Math.round(newDimensions.height * scaleFactor);
          }

          setState((previous) => {
            if (previous.width === newDimensions.width && previous.height === newDimensions.height && previous.context) {
              return previous;
            }

            return {
              pixelContentWidth,
              pixelContentHeight,
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

    /**
     * @deprecated Use `pixelContentWidth` instead
     */
    width: state.pixelContentWidth,

    /**
     * @deprecated Use `pixelContentHeight` instead
     */
    height: state.pixelContentHeight,

    pixelContentWidth: state.pixelContentWidth,
    pixelContentHeight: state.pixelContentHeight,

    context: state.context,
    ratio: scaleFactor,
    setRef,
    ref,
  };
}
