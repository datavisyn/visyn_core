/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/first */
if (typeof window.URL.createObjectURL === 'undefined') {
  // @ts-ignore
  window.URL.createObjectURL = () => {
    // Mock this function for mapbox-gl to work
  };
}

import * as React from 'react';

import type { Plotly as PlotlyTypes } from './full';

// Copied types from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-plotly.js/index.d.ts
// as it depends on "@types/plotly.js": "*", causing the latest/incompatible version to be installed.
export interface Figure {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  frames: Plotly.Frame[] | null;
}

export interface PlotParams {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  frames?: Plotly.Frame[] | undefined;
  config?: Partial<Plotly.Config> | undefined;
  /**
   * When provided, causes the plot to update only when the revision is incremented.
   */
  revision?: number | undefined;
  /**
   * Callback executed after plot is initialized.
   * @param figure Object with three keys corresponding to input props: data, layout and frames.
   * @param graphDiv Reference to the DOM node into which the figure was rendered.
   */
  onInitialized?: ((figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => void) | undefined;
  /**
   * Callback executed when when a plot is updated due to new data or layout, or when user interacts with a plot.
   * @param figure Object with three keys corresponding to input props: data, layout and frames.
   * @param graphDiv Reference to the DOM node into which the figure was rendered.
   */
  onUpdate?: ((figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => void) | undefined;
  /**
   * Callback executed when component unmounts, before Plotly.purge strips the graphDiv of all private attributes.
   * @param figure Object with three keys corresponding to input props: data, layout and frames.
   * @param graphDiv Reference to the DOM node into which the figure was rendered.
   */
  onPurge?: ((figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => void) | undefined;
  /**
   * Callback executed when a plotly.js API method rejects
   * @param err Error
   */
  onError?: ((err: Readonly<Error>) => void) | undefined;
  /**
   * id assigned to the <div> into which the plot is rendered.
   */
  divId?: string | undefined;
  /**
   * applied to the <div> into which the plot is rendered
   */
  className?: string | undefined;
  /**
   * used to style the <div> into which the plot is rendered
   */
  style?: React.CSSProperties | undefined;
  /**
   * Assign the graph div to window.gd for debugging
   */
  debug?: boolean | undefined;
  /**
   * When true, adds a call to Plotly.Plot.resize() as a window.resize event handler
   */
  useResizeHandler?: boolean | undefined;

  onAfterExport?: (() => void) | undefined;
  onAfterPlot?: (() => void) | undefined;
  onAnimated?: (() => void) | undefined;
  onAnimatingFrame?: ((event: Readonly<Plotly.FrameAnimationEvent>) => void) | undefined;
  onAnimationInterrupted?: (() => void) | undefined;
  onAutoSize?: (() => void) | undefined;
  onBeforeExport?: (() => void) | undefined;
  onBeforeHover?: ((event: Readonly<Plotly.PlotMouseEvent>) => boolean) | undefined;
  onButtonClicked?: ((event: Readonly<Plotly.ButtonClickEvent>) => void) | undefined;
  onClick?: ((event: Readonly<Plotly.PlotMouseEvent>) => void) | undefined;
  onClickAnnotation?: ((event: Readonly<Plotly.ClickAnnotationEvent>) => void) | undefined;
  onDeselect?: (() => void) | undefined;
  onDoubleClick?: (() => void) | undefined;
  onFramework?: (() => void) | undefined;
  onHover?: ((event: Readonly<Plotly.PlotHoverEvent>) => void) | undefined;
  onLegendClick?: ((event: Readonly<Plotly.LegendClickEvent>) => boolean) | undefined;
  onLegendDoubleClick?: ((event: Readonly<Plotly.LegendClickEvent>) => boolean) | undefined;
  onRelayout?: ((event: Readonly<Plotly.PlotRelayoutEvent>) => void) | undefined;
  onRestyle?: ((event: Readonly<Plotly.PlotRestyleEvent>) => void) | undefined;
  onRedraw?: (() => void) | undefined;
  onSelected?: ((event: Readonly<Plotly.PlotSelectionEvent>) => void) | undefined;
  onSelecting?: ((event: Readonly<Plotly.PlotSelectionEvent>) => void) | undefined;
  onSliderChange?: ((event: Readonly<Plotly.SliderChangeEvent>) => void) | undefined;
  onSliderEnd?: ((event: Readonly<Plotly.SliderEndEvent>) => void) | undefined;
  onSliderStart?: ((event: Readonly<Plotly.SliderStartEvent>) => void) | undefined;
  onTransitioning?: (() => void) | undefined;
  onTransitionInterrupted?: (() => void) | undefined;
  onUnhover?: ((event: Readonly<Plotly.PlotMouseEvent>) => void) | undefined;
  onWebGlContextLost?: (() => void) | undefined;
}

// Lazily load plotly.js-dist-min to allow code-splitting to occur, otherwise plotly is loaded everytime visyn_core is imported.
const LazyPlotlyComponent = React.lazy(() =>
  Promise.all([
    import('plotly.js-dist-min'),
    // @ts-ignore
    import('react-plotly.js/factory'),
  ]).then(([plotly, createPlotlyComponent]) => ({
    // Use the minified version for our own `Plotly` object
    default: createPlotlyComponent.default(plotly.default) as React.ComponentType<PlotParams>,
  })),
);

// The actually exported plotly component is wrapped in Suspense to allow lazy loading
export function PlotlyComponent(props: PlotParams) {
  return (
    <React.Suspense fallback={null}>
      <LazyPlotlyComponent {...props} />
    </React.Suspense>
  );
}

// Reexport only the plotly typings
export { PlotlyTypes };
