import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';
import * as React from 'react';
import { BaseVisConfig, EAggregateTypes, ESupportedPlotlyVis } from './interfaces';
import { IBarConfig } from './bar/interfaces';
import { sanitize } from '../utils';

export type DownloadPlotOptions = {
  fileName?: string;
};

export function useCaptureVisScreenshot(uniquePlotId: string, visConfig: BaseVisConfig, options?: DownloadPlotOptions) {
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
          filename: `${options?.fileName ?? visConfig.type}`,
          height: plotElement.offsetHeight,
          width: plotElement.offsetWidth,
        });
      } else if (visConfig.type === ESupportedPlotlyVis.BAR) {
        const config = visConfig as IBarConfig;
        const viewingSingleBarChart =
          !config.facets ||
          (config.facets && typeof config.focusFacetIndex === 'number') ||
          (config.facets && plotElement.querySelectorAll('[data-in-viewport="true"] canvas').length === 1);
        if (viewingSingleBarChart) {
          const dataUrl = await htmlToImage.toPng(plotElement.querySelector('canvas')!, {
            backgroundColor: 'white',
            width: plotElement.querySelector('canvas')?.width,
            height: plotElement.querySelector('canvas')?.height,
            canvasWidth: plotElement.querySelector('canvas')?.width,
            canvasHeight: plotElement.querySelector('canvas')?.height,
            cacheBust: true,
          });

          const link = document.createElement('a');
          link.download = `${options?.fileName ?? visConfig.type}.png`;
          link.href = dataUrl;
          link.click();
          link.remove();
        } else {
          const zip = new JSZip();
          const boxList = plotElement.querySelectorAll('[data-facet]') as NodeListOf<HTMLDivElement>;
          const canvasList = plotElement.querySelectorAll('[data-facet] canvas') as NodeListOf<HTMLCanvasElement>;
          const blobList = await Promise.all(
            Array.from(canvasList).map(async (canvas) => {
              const blob = await htmlToImage.toBlob(canvas, {
                backgroundColor: 'white',
                width: canvas.width,
                height: canvas.height,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                cacheBust: true,
              });
              return blob;
            }),
          );
          blobList.forEach((blob, i) => {
            if (blob) {
              const fileName = `${sanitize(config?.facets?.name as string)} - ${sanitize(boxList[i]?.dataset?.facet as string)} -- ${config?.aggregateType === EAggregateTypes.COUNT ? sanitize(config?.aggregateType as string) : sanitize(`${config?.aggregateType} of ${config?.aggregateColumn?.name}`)} - ${sanitize(config?.catColumnSelected?.name as string)}`;
              zip.file(`${fileName}.png`, blob);
            }
          });
          const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
          const link = document.createElement('a');
          link.download = `${options?.fileName ?? visConfig.type}.zip`;
          link.href = URL.createObjectURL(content);
          link.click();
          link.remove();
        }
      } else {
        const dataUrl = await htmlToImage.toPng(plotElement.querySelector('canvas')!, {
          backgroundColor: 'white',
          cacheBust: true,
        });
        const link = document.createElement('a');
        link.download = `${options?.fileName ?? visConfig.type}.png`;
        link.href = dataUrl;
        link.click();
        link.remove();
      }
    } catch (e) {
      setIsLoading(false);
      setError((e as { message: string }).message);
    }

    setIsLoading(false);
  }, [options?.fileName, uniquePlotId, visConfig]);

  return [{ isLoading, error }, captureScreenshot] as const;
}
