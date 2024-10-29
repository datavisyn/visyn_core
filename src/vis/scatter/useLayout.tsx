import clamp from 'lodash/clamp';
import * as React from 'react';
import { PlotlyTypes } from '../../plotly';
import { VIS_NEUTRAL_COLOR, VIS_TRACES_COLOR } from '../general/constants';
import { FastTextMeasure } from '../general/FastTextMeasure';
import { getLabelOrUnknown } from '../general/utils';
import { IInternalScatterConfig } from './interfaces';
import { useDataPreparation } from './useDataPreparation';

const textMeasure = new FastTextMeasure('12px Open Sans');

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
  margin: { l: 50, r: 20, b: 50, t: 20, pad: 4 },
};

function gaps(width: number, height: number, nSubplots: number) {
  let nColumns = clamp(Math.floor(width / 400), 2, 4);
  if (nColumns > nSubplots) {
    nColumns = nSubplots;
  }
  // round up to the number of rows required, otherwise, we get chart overlap
  const nRows = Math.ceil(nSubplots / nColumns);

  // "Hack" to calculate the correct yGap by translating absolute to relative plotly units
  const requiredYGap = nRows * 50;
  const yGap = requiredYGap / height;

  const requiredXGap = nColumns * 50;
  const xGap = requiredXGap / width;

  return {
    nColumns,
    nRows,
    xGap,
    yGap,
    xTitleSize: width / nColumns - 25,
    yTitleSize: height / nRows - 25,
  };
}

export function useLayout({
  scatter,
  facet,
  splom,
  subplots,
  regressions,
  config,
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
  width: number;
  height: number;
  internalLayoutRef: React.MutableRefObject<Partial<PlotlyTypes.Layout>>;
}) {
  return React.useMemo<Partial<PlotlyTypes.Layout> | undefined>(() => {
    if (subplots) {
      const axes: Record<string, Partial<PlotlyTypes.LayoutAxis>> = {};
      const titleAnnotations: Partial<PlotlyTypes.Annotations>[] = [];

      const { nColumns, nRows, xGap, yGap, xTitleSize, yTitleSize } = gaps(width, height, subplots.xyPairs.length);

      subplots.xyPairs.forEach((pair, plotCounter) => {
        axes[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: pair.xDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'xaxis'] || {}),
          title: {
            text: textMeasure.textEllipsis(pair.xTitle, xTitleSize),
            standoff: 0,
            font: {
              size: 12,
              color: VIS_NEUTRAL_COLOR,
            },
          },
        };
        axes[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: pair.yDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'yaxis'] || {}),
          title: {
            font: {
              size: 12,
              color: VIS_NEUTRAL_COLOR,
            },
            text: textMeasure.textEllipsis(pair.yTitle, yTitleSize),
          },
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

      // if we only find one facet (e.g., the categorical column only contains one value), we don't facet
      const finalLayout: Partial<PlotlyTypes.Layout> =
        subplots.xyPairs.length > 1
          ? {
              ...BASE_LAYOUT,
              ...(internalLayoutRef.current || {}),
              grid: { rows: nRows, columns: nColumns, xgap: xGap, ygap: yGap, pattern: 'independent' },
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

      const { nColumns, nRows, xGap, yGap, xTitleSize, yTitleSize } = gaps(width, height, facet.resultData.length);

      facet.resultData.forEach((group, plotCounter) => {
        axes[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: facet.xDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'xaxis'] || {}),
          ...(plotCounter > 0 ? { matches: 'x' } : {}),
          // @ts-ignore
          anchor: `y${plotCounter > 0 ? plotCounter + 1 : ''}`,
          title: {
            font: {
              size: 12,
              color: VIS_NEUTRAL_COLOR,
            },
            standoff: 0,
            text: textMeasure.textEllipsis(facet.xTitle, xTitleSize),
          },
        };
        axes[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: facet.yDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'yaxis'] || {}),
          ...(plotCounter > 0 ? { matches: 'y' } : {}),
          // @ts-ignore
          anchor: `x${plotCounter > 0 ? plotCounter + 1 : ''}`,
          title: {
            font: {
              size: 12,
              color: VIS_NEUTRAL_COLOR,
            },
            text: textMeasure.textEllipsis(facet.yTitle, yTitleSize),
          },
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

      // if we only find one facet (e.g., the categorical column only contains one value), we don't facet
      const finalLayout: Partial<PlotlyTypes.Layout> =
        facet?.resultData.length > 1
          ? {
              ...BASE_LAYOUT,
              ...(internalLayoutRef.current || {}),
              grid: { rows: nRows, columns: nColumns, xgap: xGap, ygap: yGap, pattern: 'independent' },
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
  }, [subplots, scatter, facet, splom, internalLayoutRef, regressions.annotations, regressions.shapes, config, width, height]);
}
