/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { useDebouncedCallback, useSetState } from '@mantine/hooks';
import { BarChart, FunnelChart, LineChart, PieChart, SankeyChart, ScatterChart } from 'echarts/charts';
import type {
  // The series option types are defined with the SeriesOption suffix
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  SankeySeriesOption,
  FunnelSeriesOption,
  ScatterSeriesOption,
} from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  SingleAxisComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  BrushComponent,
} from 'echarts/components';
import type {
  // The component option types are defined with the ComponentOption suffix
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
} from 'echarts/components';
import type { ComposeOption, ECElementEvent, ECharts } from 'echarts/core';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useSetRef } from '../hooks/useSetRef';

export type ECSeries = BarSeriesOption | LineSeriesOption | SankeySeriesOption | FunnelSeriesOption | ScatterSeriesOption | PieSeriesOption;

export type ECOption = ComposeOption<ECSeries | TooltipComponentOption | GridComponentOption | DatasetComponentOption | TitleComponentOption>;

// Original code from https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-optimizing-bundle-size-29l8
// Register the required components
use([
  SingleAxisComponent,
  BrushComponent,
  LegendComponent,
  LineChart,
  BarChart,
  PieChart,
  FunnelChart,
  SankeyChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent, // A group of utility tools, which includes export, data view, dynamic type switching, data area zooming, and reset.
  DataZoomComponent, // Used in Line Graph Charts
  CanvasRenderer, // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
]);

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

type ExoticEventName = 'brush' | 'brushEnd' | 'brushselected' | 'highlight' | 'downplay';

// Type for mouse handlers in function form
export type CallbackFunction = (event: ECElementEvent) => void;

export type ExoticCallbackFunction = (event: unknown) => void;

// Type for mouse handlers in object form
export type CallbackObject = {
  query?: string | object;
  handler: CallbackFunction;
};

export type ExoticCallbackObject = {
  query?: string | object;
  handler: ExoticCallbackFunction;
};

// Array of mouse handlers
export type CallbackArray = (CallbackFunction | CallbackObject)[];

export type ExoticCallbackArray = (ExoticCallbackFunction | ExoticCallbackObject)[];

export function useChart({
  options,
  settings,
  mouseEvents,
}: {
  options?: ECOption;
  settings?: Parameters<ECharts['setOption']>[1];
  mouseEvents?: Partial<
    { [K in ElementEventName]: CallbackArray | CallbackFunction | CallbackObject } & {
      [K in ExoticEventName]: ExoticCallbackArray | ExoticCallbackFunction | ExoticCallbackObject;
    }
  >;
}) {
  const [state, setState] = useSetState({
    width: 0,
    height: 0,
    internalObserver: null as ResizeObserver | null,
    instance: null as ECharts | null,
  });

  const mouseEventsRef = React.useRef(mouseEvents);
  mouseEventsRef.current = mouseEvents;

  const syncEvents = (instance: ECharts) => {
    // Remove old events
    Object.keys(mouseEventsRef.current ?? {}).forEach((eventName) => {
      instance.off(eventName);
    });

    // Readd new events -> this is necessary when adding options for instance
    Object.keys(mouseEventsRef.current ?? {}).forEach((e) => {
      const eventName = e as ElementEventName;
      const value = mouseEventsRef.current?.[eventName as ElementEventName];

      // Either the value is a handler like () => ..., an object with a query or an array containing both types

      if (Array.isArray(value)) {
        value.forEach((handler, index) => {
          if (typeof handler === 'function') {
            instance.on(eventName, (params: ECElementEvent) => ((mouseEventsRef.current?.[eventName] as CallbackArray)[index] as CallbackFunction)(params));
          } else if (!handler.query) {
            instance.on(eventName, (params: ECElementEvent) =>
              ((mouseEventsRef.current?.[eventName] as CallbackArray)[index] as CallbackObject).handler(params),
            );
          } else {
            instance.on(eventName, handler.query, (params: ECElementEvent) =>
              ((mouseEventsRef.current?.[eventName] as CallbackArray)[index] as CallbackObject).handler(params),
            );
          }
        });
        return;
      }

      if (typeof value === 'function') {
        instance.on(eventName, (...args) => (mouseEventsRef.current?.[eventName] as CallbackFunction)(...args));
      } else if (typeof value === 'object') {
        if (!value.query) {
          instance.on(eventName, (...args) => (mouseEventsRef.current?.[eventName] as CallbackObject).handler(...args));
        } else {
          instance.on(eventName, value.query, (...args) => (mouseEventsRef.current?.[eventName] as CallbackObject).handler(...args));
        }
      }
    });
  };

  const { ref, setRef } = useSetRef<HTMLElement>({
    register: (element) => {
      const observer = new ResizeObserver(
        // NOTE: @dv-usama-ansari: This callback can be debounced for performance reasons
        (entries: ResizeObserverEntry[]) => {
          const newDimensions = entries[0]?.contentRect;
          setState({ width: newDimensions?.width, height: newDimensions?.height });
        },
      );
      // create the instance
      const instance = init(element);
      // Save the mouse events
      syncEvents(instance);
      setState({ instance, internalObserver: observer });
      observer.observe(element);
    },
    cleanup() {
      state.instance?.dispose();
    },
  });

  React.useEffect(() => {
    if (state.instance) {
      state.instance.resize();
    }
  }, [state]);

  React.useEffect(() => {
    if (state.instance && state.width > 0 && state.height > 0) {
      // This should be the last use effect since a resize stops the animation
      state.instance.setOption(options!, settings);
      // Sync events
      syncEvents(state.instance);
    }
  }, [state, options, settings]);

  return { ref, setRef, instance: state.instance };
}
