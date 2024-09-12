import { useSetState } from '@mantine/hooks';
import * as echarts from 'echarts';
import { ECElementEvent, ECharts, EChartsOption } from 'echarts';
import React from 'react';
import { useSetRef } from 'visyn_core/hooks';

type ElementEventName =
  | 'click'
  | 'dblclick'
  | 'mousewheel'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup'
  | 'mousedown'
  | 'mousemove'
  | 'contextmenu'
  | 'drag'
  | 'dragstart'
  | 'dragend'
  | 'dragenter'
  | 'dragleave'
  | 'dragover'
  | 'drop'
  | 'globalout';

export type CallbackFunction = (event: ECElementEvent) => void;
export type CallbackObject = {
  query: string | object;
  handler: CallbackFunction;
};
export type CallbackArray = (CallbackFunction | CallbackObject)[];

export function useChart({
  options,
  settings,
  mouseEvents,
}: {
  options?: EChartsOption;
  settings?: Parameters<ECharts['setOption']>[1];
  // mouse events is typed with keys from mouse handler types and a function that takes an event
  mouseEvents?: Partial<{ [K in ElementEventName]: CallbackArray | CallbackFunction | CallbackObject }>;
}) {
  const [state, setState] = useSetState({
    width: 0,
    height: 0,
    internalObserver: null as ResizeObserver,
    instance: null as ECharts,
  });

  const mouseEventsRef = React.useRef(mouseEvents);
  mouseEventsRef.current = mouseEvents;

  const syncEvents = (instance: ECharts) => {
    // Remove old events
    Object.keys(mouseEventsRef.current ?? {}).forEach((eventName) => {
      instance.off(eventName);
    });
    // Readd new events -> this is necessary when adding options for instance
    Object.keys(mouseEventsRef.current ?? {}).forEach((eventName) => {
      const value = mouseEventsRef.current[eventName as ElementEventName];
      // Check if we have multiple event listeners
      if (Array.isArray(value)) {
        value.forEach((handler, index) => {
          if (typeof handler === 'function') {
            instance.on(eventName, (params: ECElementEvent) =>
              ((mouseEventsRef.current[eventName as ElementEventName] as CallbackArray)[index] as CallbackFunction)(params),
            );
          } else {
            instance.on(eventName, handler.query, (params: ECElementEvent) =>
              ((mouseEventsRef.current[eventName as ElementEventName] as CallbackArray)[index] as CallbackObject).handler(params),
            );
          }
        });
        return;
      }

      if (typeof value === 'function') {
        instance.on(eventName, value);
        return;
      }

      if (typeof value === 'object') {
        instance.on(eventName, value.query, value.handler);
      }
    });
  };
  const { ref, setRef } = useSetRef<HTMLElement>({
    register: (element) => {
      const observer = new ResizeObserver((entries) => {
        const newDimensions = entries[0].contentRect;
        setState({ width: newDimensions.width, height: newDimensions.height });
      });
      // create the instance
      const instance = echarts.init(element);
      // Save the mouse events
      syncEvents(instance);
      setState({ instance, internalObserver: observer });
      observer.observe(element);
    },
    cleanup() {
      state.instance.dispose();
    },
  });
  React.useEffect(() => {
    if (state.instance) {
      state.instance.resize();
    }
  }, [state]);
  React.useEffect(() => {
    if (state.instance && state.width && state.height) {
      // This should be the last use effect since a resize stops the animation
      state.instance.setOption(options, settings);
      // Sync events
      syncEvents(state.instance);
    }
  }, [state, options, settings]);
  return { ref, setRef, instance: state.instance };
}
