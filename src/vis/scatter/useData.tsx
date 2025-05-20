import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { ELabelingOptions, IScatterConfig } from './interfaces';
import { useDataPreparation } from './useDataPreparation';
import { FetchColumnDataResult } from './utils';
import { PlotlyTypes } from '../../plotly';
import { selectionColorDark } from '../../utils/colors';
import { DEFAULT_COLOR, VIS_NEUTRAL_COLOR } from '../general/constants';
import { columnNameWithDescription, truncateText } from '../general/layoutUtils';
import { getLabelOrUnknown } from '../general/utils';

export function baseData(alpha: number, hasColor: boolean): Partial<PlotlyTypes.Data> {
  return {
    selected: {
      textfont: {
        color: DEFAULT_COLOR,
      },
      marker: {
        opacity: 1,
        ...(!hasColor ? { color: selectionColorDark } : {}),
      },
    },
    unselected: {
      textfont: {
        color: VIS_NEUTRAL_COLOR,
      },
      marker: {
        color: VIS_NEUTRAL_COLOR,
        opacity: Math.min(alpha, 0.15),
      },
    },
  };
}

export const textPositionOptions = ['top center', 'bottom center'];

export const BASE_DATA: Partial<PlotlyTypes.Data> = {
  showlegend: false,
  hoverinfo: 'x+y+text',
};

export function useData({
  status,
  value,
  scatter,
  config,
  facet,
  splom,
  subplots,
  selectedList,
  shapeScale,
  mappingFunction,
}: {
  status: string;
  value: FetchColumnDataResult | undefined;
  scatter?: ReturnType<typeof useDataPreparation>['scatter'];
  config: IScatterConfig;
  facet?: ReturnType<typeof useDataPreparation>['facet'];
  splom?: ReturnType<typeof useDataPreparation>['splom'];
  subplots?: ReturnType<typeof useDataPreparation>['subplots'];
  selectedList: string[];
  shapeScale: (val: string) => string;
  mappingFunction?: (val: string | number | null | undefined) => string;
}) {
  const selectedSet = React.useMemo(() => new Set(selectedList), [selectedList]);

  return React.useMemo<PlotlyTypes.Data[]>(() => {
    if (status !== 'success' || !value) {
      return [];
    }
    const fullOpacityOrAlpha = selectedSet.size > 0 ? 1 : config.alphaSliderVal;

    if (subplots) {
      const visibleLabelsSet = config.showLabelLimit ? new Set(selectedList.slice(0, config.showLabelLimit)) : selectedSet;
      const plots = subplots.xyPairs.map((pair) => {
        return {
          ...BASE_DATA,
          type: 'scattergl',
          x: subplots.filter.map((index) => pair.x[index]),
          y: subplots.filter.map((index) => pair.y[index]),
          xaxis: pair.xref,
          yaxis: pair.yref,
          textposition: subplots.filter.map((i) => textPositionOptions[i % textPositionOptions.length]),
          ...(isEmpty(selectedSet) ? {} : { selectedpoints: selectedList.map((idx) => subplots.idToIndex.get(idx)) }),
          mode: config.showLabels === ELabelingOptions.NEVER || config.xAxisScale === 'log' || config.yAxisScale === 'log' ? 'markers' : 'text+markers',
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: subplots.filter.map((t) => truncateText(value.idToLabelMapper(subplots.text[t]!), true, 10)),
                }
              : {
                  text: subplots.filter.map((i) =>
                    visibleLabelsSet.has(subplots.ids[i]!) ? truncateText(value.idToLabelMapper(subplots.text[i]!), true, 10) : '',
                  ),
                }),
          hovertext: subplots.ids.map((p_id, index) =>
            `${value.idToLabelMapper(p_id)}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(p_id))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[index]?.val)}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[index]?.val)}` : ''}`.trim(),
          ),
          marker: {
            color:
              value.colorColumn && mappingFunction
                ? subplots.filter.map((index) => mappingFunction(value.colorColumn.resolvedValues[index]?.val as string))
                : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? subplots.filter.map((index) => shapeScale(value.shapeColumn.resolvedValues[index]?.val as string)) : 'circle',
            opacity: fullOpacityOrAlpha,
            size: 8,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data;
      });

      return plots;
    }

    if (scatter && config && value && value.validColumns[0]) {
      const visibleLabelsSet = config.showLabelLimit ? new Set(selectedList.slice(0, config.showLabelLimit)) : selectedSet;
      const traces = [
        {
          ...BASE_DATA,
          type: 'scattergl',
          x: scatter.filter.map((index) => scatter.plotlyData.x[index]),
          y: scatter.filter.map((index) => scatter.plotlyData.y[index]),
          // text: scatter.plotlyData.text,
          textposition: scatter.filter.map((index) => textPositionOptions[index % textPositionOptions.length]),
          ...(isEmpty(selectedSet)
            ? {}
            : { selectedpoints: selectedList.map((idx) => scatter.idToIndex.get(idx)).filter((v) => v !== undefined && v !== null) }),
          mode: config.showLabels === ELabelingOptions.NEVER || config.xAxisScale === 'log' || config.yAxisScale === 'log' ? 'markers' : 'text+markers',
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: scatter.filter.map((index) => truncateText(value.idToLabelMapper(scatter.plotlyData.text[index]!), true, 10)),
                }
              : {
                  text: scatter.filter.map((index) =>
                    visibleLabelsSet.has(scatter.ids[index]!)
                      ? truncateText(value.idToLabelMapper(value.idToLabelMapper(scatter.plotlyData.text[index]!)), true, 10)
                      : '',
                  ),
                }),
          hovertext: scatter.filter.map((index) => {
            const resolvedLabelString =
              value.resolvedLabelColumns?.length > 0
                ? value.resolvedLabelColumns.map((l) => `<b>${columnNameWithDescription(l.info)}</b>: ${getLabelOrUnknown(l.resolvedValues[index]?.val)}<br />`)
                : '';
            const idString = `<b>${value.idToLabelMapper(scatter.plotlyData.text[index]!)}</b><br />`;
            const xString = `<b>${columnNameWithDescription(value.validColumns[0]!.info)}</b>: ${getLabelOrUnknown(value.validColumns[0]!.resolvedValues[index]?.val)}<br />`;
            const yString = `<b>${columnNameWithDescription(value.validColumns[1]!.info)}</b>: ${getLabelOrUnknown(value.validColumns[1]!.resolvedValues[index]?.val)}<br />`;
            const colorColumnString = value.colorColumn
              ? `<b>${columnNameWithDescription(value.colorColumn.info)}</b>: ${getLabelOrUnknown(value.colorColumn.resolvedValues[index]?.val)}<br />`
              : '';
            const shapeColumnString =
              value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id
                ? `<b>${columnNameWithDescription(value.shapeColumn.info)}</b>: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[index]?.val)}<br />`
                : '';

            return `${idString}${xString}${yString}${resolvedLabelString}${colorColumnString}${shapeColumnString}`;
          }),
          marker: {
            textfont: {
              color: VIS_NEUTRAL_COLOR,
            },
            size: 8,
            color:
              value.colorColumn && mappingFunction
                ? scatter.filter.map((index) => mappingFunction(value.colorColumn.resolvedValues[index]!.val as string))
                : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? scatter.filter.map((index) => shapeScale(value.shapeColumn.resolvedValues[index]!.val as string)) : 'circle',
            opacity: fullOpacityOrAlpha,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data,
      ];

      return traces;
    }

    if (facet && config && value && value.validColumns[0] && value.validColumns[1]) {
      const plots = facet.resultData.map((group) => {
        const visibleLabelsSet = config.showLabelLimit
          ? new Set(group.data.ids.filter((id) => selectedSet.has(id)).slice(0, config.showLabelLimit))
          : selectedSet;
        return {
          ...BASE_DATA,
          type: 'scattergl',
          x: group.filter.map((index) => group.data.x[index]),
          y: group.filter.map((index) => group.data.y[index]),
          xaxis: group.xref,
          yaxis: group.yref,
          mode: config.showLabels === ELabelingOptions.NEVER || config.xAxisScale === 'log' || config.yAxisScale === 'log' ? 'markers' : 'text+markers',
          textposition: group.data.text.map((_, i) => textPositionOptions[i % textPositionOptions.length]),
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: group.data.text.map((t) => truncateText(value.idToLabelMapper(t), true, 10)),
                  // textposition: 'top center',
                }
              : {
                  text: group.data.text.map((t, i) => (visibleLabelsSet.has(group.data.ids[i]!) ? truncateText(value.idToLabelMapper(t), true, 10) : '')),
                  // textposition: 'top center',
                }),
          name: getLabelOrUnknown(group.data.facet),
          ...(isEmpty(selectedSet) ? {} : { selectedpoints: selectedList.map((idx) => group.idToIndex.get(idx)).filter((v) => v !== undefined) }),
          hovertext: group.data.ids.map((p_id, index) =>
            `${value.idToLabelMapper(p_id)}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(p_id))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(group.data.color[index])}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(group.data.shape[index])}` : ''}`.trim(),
          ),
          marker: {
            color: value.colorColumn && mappingFunction ? group.filter.map((index) => mappingFunction(group.data.color[index])) : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? group.filter.map((index) => shapeScale(group.data.shape[index] as string)) : 'circle',
            opacity: fullOpacityOrAlpha,
            size: 8,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data;
      });

      return plots;
    }

    if (splom && value.validColumns[0]) {
      const traces = [
        {
          ...BASE_DATA,
          type: 'splom',
          // @ts-ignore
          diagonal: {
            visible: false,
          },
          showupperhalf: false,
          // @ts-ignore
          dimensions: splom.dimensions,
          hovertext: value.validColumns[0].resolvedValues.map((v, i) =>
            `${value.idToLabelMapper(v.id)}
  ${(value.resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i]?.val)}`)}
  ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[i]?.val)}` : ''}
  ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[i]?.val)}` : ''}`.trim(),
          ),
          ...(isEmpty(selectedSet) ? {} : { selectedpoints: selectedList.map((idx) => splom.idToIndex.get(idx)) }),
          marker: {
            size: 8,
            color:
              value.colorColumn && mappingFunction
                ? splom.filter.map((index) => mappingFunction(value.colorColumn.resolvedValues[index]!.val))
                : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? splom.filter.map((index) => shapeScale(value.shapeColumn.resolvedValues[index]!.val as string)) : 'circle',
            opacity: fullOpacityOrAlpha,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data,
      ];

      return traces;
    }

    return [];
  }, [status, value, subplots, scatter, config, facet, splom, selectedList, selectedSet, shapeScale, mappingFunction]);
}
