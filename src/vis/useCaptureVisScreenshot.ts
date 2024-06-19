import * as htmlToImage from 'html-to-image';
import * as React from 'react';
import { BaseVisConfig, ESupportedPlotlyVis } from './interfaces';

export function useCaptureVisScreenshot(uniquePlotId: string, visConfig: BaseVisConfig) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const captureScreenshot = React.useCallback(async () => {
    const plotElement = document.getElementById(uniquePlotId);
    if (plotElement === null) {
      console.error('Could not find plot div to capture screenshot');
      return;
    }
    try {
      if ([ESupportedPlotlyVis.SCATTER, ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.SANKEY].includes(visConfig.type as ESupportedPlotlyVis)) {
        const Plotly = await import('plotly.js-dist-min');
        await Plotly.downloadImage(plotElement, {
          format: 'png',
          filename: `${visConfig.type}`,
          height: plotElement.offsetHeight,
          width: plotElement.offsetWidth,
        });
      } else {
        await htmlToImage.toPng(plotElement, { backgroundColor: 'white' }).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${visConfig.type}.png`;
          link.href = dataUrl;
          link.click();
        });
      }
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
    }

    setIsLoading(false);
  }, [uniquePlotId, visConfig.type]);

  return [{ isLoading, error }, captureScreenshot] as const;
}
