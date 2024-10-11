const { init, use } = require('echarts/core');
const { BarChart } = require('echarts/charts');
const { LegendComponent, GridComponent, TooltipComponent, TitleComponent } = require('echarts/components');
const { CanvasRenderer } = require('echarts/renderers');

// NOTE: @dv-usama-ansari, @dvtschachinger: This is the implementation of Worker with OffscreenCanvas.
//  What works:
//  - The worker can be initialized with an OffscreenCanvas.
//  - The worker can be resized with a new width and height.
//  - The worker can be updated with new options.
//  - Has a significant performance boost.
//  What doesn't work:
//  - The events are not working. The click / hover events are not being triggered.
//  - The worker can't be destroyed and re-initialized.
//  - The worker is not very reactive to the config changes.
//  - The worker can't be used with renderers other than CanvasRenderer.
//  - The worker can't handle formatters in the `options`. `options` need to serialized before sending to the worker.


use([
  LegendComponent,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer, // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
]);

let ctx, offscreenCanvas;

self.onmessage = async (event) => {
  console.log('in worker');
  const { canvas, options, type, width, height, config } = event.data;

  if (canvas instanceof OffscreenCanvas && type === 'init') {
    // Initialize the 2D rendering context
    offscreenCanvas = canvas;
    ctx = offscreenCanvas.getContext('2d');
    // Initialize ECharts with the OffscreenCanvas context
    const chart = init(offscreenCanvas);
    chart.setOption(options);
  } else if (offscreenCanvas instanceof OffscreenCanvas && type === 'resize') {
    // Handle resizing of the chart
    const chart = init(offscreenCanvas);
    chart.setOption(options);
    chart.resize({ width, height });
  }
};
