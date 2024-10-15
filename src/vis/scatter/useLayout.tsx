import * as React from 'react';
import clamp from 'lodash/clamp';
import { PlotlyTypes } from '../../plotly';
import { VIS_NEUTRAL_COLOR, VIS_TRACES_COLOR } from '../general/constants';
import { IInternalScatterConfig } from './interfaces';
import { getLabelOrUnknown } from '../general/utils';
import { useDataPreparation } from './useDataPreparation';

export const AXIS_TICK_STYLES: Partial<PlotlyTypes.Layout['xaxis']> = {
  tickfont: {
    color: VIS_NEUTRAL_COLOR,
  },
  title: {
    font: {
      size: 12,
      color: VIS_NEUTRAL_COLOR,
    },
  },
  zeroline: false,
};

export const BASE_LAYOUT: Partial<PlotlyTypes.Layout> = {
  hovermode: 'closest',
  hoverlabel: {
    align: 'left',
  },
  margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
};

export function useLayout({
  scatter,
  facet,
  splom,
  subplots,
  regressions,
  config,
  dimensions,
  width,
  height,
  internalLayoutRef,
}: {
  scatter?: ReturnType<typeof useDataPreparation>['scatter'];
  facet?: ReturnType<typeof useDataPreparation>['facet'];
  splom?: ReturnType<typeof useDataPreparation>['splom'];
  subplots?: ReturnType<typeof useDataPreparation>['subplots'];
  regressions: { shapes: Partial<PlotlyTypes.Shape>[]; annotations: Partial<PlotlyTypes.Annotations>[] };
  config: IInternalScatterConfig;
  dimensions: { width: number; height: number };
  width: number;
  height: number;
  internalLayoutRef: React.MutableRefObject<Partial<PlotlyTypes.Layout>>;
}) {
  return React.useMemo<Partial<PlotlyTypes.Layout> | undefined>(() => {
    if (subplots) {
      const axes: Record<string, Partial<PlotlyTypes.LayoutAxis>> = {};
      const titleAnnotations: Partial<PlotlyTypes.Annotations>[] = [];

      subplots.xyPairs.forEach((pair, plotCounter) => {
        axes[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: pair.xDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'xaxis'] || {}),
          title: pair.xTitle,
        };
        axes[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: pair.yDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'yaxis'] || {}),
          title: pair.yTitle,
        };

        titleAnnotations.push({
          x: 0.5,
          y: 1,
          yshift: -12,
          xref: `x${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.XAxisName,
          yref: `y${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.YAxisName,
          xanchor: 'center',
          yanchor: 'bottom',
          text: pair.title,
          showarrow: false,
          bgcolor: '#ffffff',
          font: {
            size: 12,
            color: VIS_TRACES_COLOR,
          },
        });
      });

      let nColumns = clamp(Math.floor(dimensions.width / 400), 2, 4);
      if (nColumns > subplots.xyPairs.length) {
        nColumns = subplots.xyPairs.length;
      }
      // round up to the number of rows required, otherwise, we get chart overlap
      const nRows = Math.ceil(subplots.xyPairs.length / nColumns);

      // if we only find one facet (e.g., the categorical column only contains one value), we don't facet
      const finalLayout: Partial<PlotlyTypes.Layout> =
        subplots.xyPairs.length > 1
          ? {
              ...BASE_LAYOUT,
              ...(internalLayoutRef.current || {}),
              grid: { rows: nRows, columns: nColumns, xgap: 0.2, ygap: 0.3, pattern: 'independent' },
              ...axes,
              annotations: [...titleAnnotations, ...regressions.annotations],
              shapes: regressions.shapes,
              dragmode: config!.dragMode,
              width,
              height,
            }
          : {
              ...BASE_LAYOUT,
              xaxis: {
                ...AXIS_TICK_STYLES,
                ...internalLayoutRef.current?.xaxis,
                title: subplots.xyPairs[0]!.xTitle,
              },
              yaxis: {
                ...AXIS_TICK_STYLES,
                ...internalLayoutRef.current?.yaxis,
                title: subplots.xyPairs[0]!.yTitle,
              },
              shapes: regressions.shapes,
              annotations: [...regressions.annotations],
              dragmode: config.dragMode,
              width,
              height,
            };

      return finalLayout;
    }

    if (scatter) {
      const finalLayout: Partial<PlotlyTypes.Layout> = {
        ...BASE_LAYOUT,
        xaxis: {
          ...AXIS_TICK_STYLES,
          range: scatter.xDomain,
          ...internalLayoutRef.current?.xaxis,
          title: {
            font: {
              size: 12,
              color: VIS_NEUTRAL_COLOR,
            },
            text: scatter.xLabel,
          },
        },
        yaxis: {
          ...AXIS_TICK_STYLES,
          range: scatter.yDomain,
          ...internalLayoutRef.current?.yaxis,
          title: {
            font: {
              size: 12,
              color: VIS_NEUTRAL_COLOR,
            },
            text: scatter.yLabel,
          },
        },
        shapes: regressions.shapes,
        annotations: [...regressions.annotations],
        dragmode: config.dragMode,
        width,
        height,
      };

      return finalLayout;
    }

    if (facet) {
      const axes: Record<string, Partial<PlotlyTypes.LayoutAxis>> = {};
      const titleAnnotations: Partial<PlotlyTypes.Annotations>[] = [];

      facet.resultData.forEach((group, plotCounter) => {
        axes[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: facet.xDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'xaxis'] || {}),
          ...(plotCounter > 0 ? { matches: 'x' } : {}),
          // @ts-ignore
          anchor: `y${plotCounter > 0 ? plotCounter + 1 : ''}`,
        };
        axes[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: facet.yDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'yaxis'] || {}),
          ...(plotCounter > 0 ? { matches: 'y' } : {}),
          // @ts-ignore
          anchor: `x${plotCounter > 0 ? plotCounter + 1 : ''}`,
        };

        titleAnnotations.push({
          x: 0.5,
          y: 1,
          yshift: -12,
          xref: `x${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.XAxisName,
          yref: `y${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.YAxisName,
          xanchor: 'center',
          yanchor: 'bottom',
          text: getLabelOrUnknown(group.data.facet),
          showarrow: false,
          bgcolor: '#ffffff',
          font: {
            size: 12,
            color: VIS_TRACES_COLOR,
          },
        });
      });

      let nColumns = clamp(Math.floor(dimensions.width / 400), 2, 4);
      if (nColumns > facet.resultData.length) {
        nColumns = facet.resultData.length;
      }
      // round up to the number of rows required, otherwise, we get chart overlap
      const nRows = Math.ceil(facet.resultData.length / nColumns);

      // if we only find one facet (e.g., the categorical column only contains one value), we don't facet
      const finalLayout: Partial<PlotlyTypes.Layout> =
        facet?.resultData.length > 1
          ? {
              ...BASE_LAYOUT,
              ...(internalLayoutRef.current || {}),
              grid: { rows: nRows, columns: nColumns, xgap: 0.2, ygap: 0.3, pattern: 'independent' },
              ...axes,
              annotations: [...titleAnnotations, ...regressions.annotations],
              shapes: regressions.shapes,
              dragmode: config!.dragMode,
              width,
              height,
            }
          : {
              ...BASE_LAYOUT,
              xaxis: {
                ...AXIS_TICK_STYLES,
                range: facet.xDomain,
                ...internalLayoutRef.current?.xaxis,
              },
              yaxis: {
                ...AXIS_TICK_STYLES,
                range: facet.yDomain,
                ...internalLayoutRef.current?.yaxis,
              },
              shapes: regressions.shapes,
              annotations: [...regressions.annotations],
              dragmode: config.dragMode,
              width,
              height,
            };

      return finalLayout;
    }

    if (splom) {
      // SPLOM case
      const axes: Record<string, PlotlyTypes.LayoutAxis> = {};

      const axis = () =>
        ({
          ...AXIS_TICK_STYLES,
        }) as PlotlyTypes.LayoutAxis;

      for (let i = 0; i < splom.dimensions.length; i++) {
        axes[`xaxis${i > 0 ? i + 1 : ''}`] = axis();
        axes[`yaxis${i > 0 ? i + 1 : ''}`] = axis();
      }

      const finalLayout: Partial<PlotlyTypes.Layout> = {
        ...BASE_LAYOUT,
        ...axes,
        ...(internalLayoutRef.current || {}),
        shapes: regressions.shapes,
        dragmode: config.dragMode,
        width,
        height,
      };

      return finalLayout;
    }

    return undefined;
  }, [subplots, scatter, facet, splom, dimensions.width, internalLayoutRef, regressions.annotations, regressions.shapes, config, width, height]);
}
