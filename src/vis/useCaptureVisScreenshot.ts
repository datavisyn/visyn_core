import * as htmlToImage from 'html-to-image';
import * as React from 'react';
import { Plotly } from '../plotly/full';
import { BaseVisConfig, ESupportedPlotlyVis } from './interfaces';

export function useCaptureVisScreenshot(
  uniquePlotId: string,
  visConfig: BaseVisConfig,
  screenshotOptions: { width: number; height: number } = { width: 1000, height: 800 },
) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const captureScreenshot = React.useCallback(async () => {
    const plotDiv = document.getElementById(uniquePlotId);

    if (!plotDiv) {
      console.error('Could not find plot div to capture screenshot');
      return;
    }
    try {
      if ([ESupportedPlotlyVis.SCATTER, ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.SANKEY].includes(visConfig.type as ESupportedPlotlyVis)) {
        await Plotly.downloadImage(plotDiv, { format: 'png', filename: `${visConfig.type}.png`, ...screenshotOptions });
      } else {
        await htmlToImage.toPng(plotDiv, { backgroundColor: 'white', ...screenshotOptions }).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${visConfig.type}.png`;
          link.href = dataUrl;
          link.click();
        });
      }
    } catch (e) {
      setIsLoading(false);
      setError(e.message || 'Error capturing screenshot');
    }

    setIsLoading(false);
  }, [screenshotOptions, uniquePlotId, visConfig.type]);

  return [{ isLoading, error }, captureScreenshot] as const;
}
