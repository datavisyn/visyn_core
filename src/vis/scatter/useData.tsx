import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import d3v7 from 'd3v7';
import { PlotlyTypes } from '../../plotly';
import { VIS_NEUTRAL_COLOR } from '../general/constants';
import { EColumnTypes } from '../interfaces';
import { ELabelingOptions, IInternalScatterConfig } from './interfaces';
import { FetchColumnDataResult } from './utils';
import { getLabelOrUnknown } from '../general/utils';
import { columnNameWithDescription, truncateText } from '../general/layoutUtils';
import { useDataPreparation } from './useDataPreparation';
import { selectionColorDark } from '../../utils/colors';

export function baseData(alpha: number, hasColor: boolean): Partial<PlotlyTypes.Data> {
  return {
    selected: {
      textfont: {
        color: VIS_NEUTRAL_COLOR,
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
        opacity: Math.min(alpha, 0.2),
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
  config: IInternalScatterConfig;
  facet?: ReturnType<typeof useDataPreparation>['facet'];
  splom?: ReturnType<typeof useDataPreparation>['splom'];
  subplots?: ReturnType<typeof useDataPreparation>['subplots'];
  selectedList: string[];
  shapeScale: (val: string) => string;
  mappingFunction?: (val: string | number) => string;
}) {
  return React.useMemo<PlotlyTypes.Data[]>(() => {
    if (status !== 'success' || !value) {
      return [];
    }

    if (subplots) {
      const plots = subplots.xyPairs.map((pair) => {
        return {
          ...BASE_DATA,
          type: 'scattergl',
          x: pair.x,
          y: pair.y,
          xaxis: pair.xref,
          yaxis: pair.yref,
          textposition: subplots.text.map((_, i) => textPositionOptions[i % textPositionOptions.length]),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => subplots.idToIndex.get(idx)) }),
          mode: config.showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: subplots.text.map((t) => truncateText(value.idToLabelMapper(t), true, 10)),
                }
              : {
                  text: subplots.text.map((t, i) => (selectedList.includes(subplots.ids[i] ?? '') ? truncateText(value.idToLabelMapper(t), true, 10) : '')),
                }),
          hovertext: subplots.ids.map((p_id, index) =>
            `${value.idToLabelMapper(p_id)}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(p_id))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[index]?.val)}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[index].val)}` : ''}`.trim(),
          ),
          marker: {
            color: value.colorColumn && mappingFunction ? value.colorColumn.resolvedValues.map((v) => mappingFunction(v.val)) : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? value.shapeColumn.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data;
      });

      return plots;
    }

    if (scatter && config && value && value.validColumns[0]) {
      const traces = [
        {
          ...BASE_DATA,
          type: 'scattergl',
          x: scatter.plotlyData.x,
          y: scatter.plotlyData.y,
          // text: scatter.plotlyData.text,
          textposition: scatter.plotlyData.text.map((_, i) => textPositionOptions[i % textPositionOptions.length]),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => scatter.idToIndex.get(idx)) }),
          mode: config.showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: scatter.plotlyData.text.map((t) => truncateText(value.idToLabelMapper(t), true, 10)),
                  // textposition: 'top center',
                }
              : {
                  text: scatter.plotlyData.text.map((t, i) =>
                    selectedList.includes(scatter.ids[i] ?? '') ? truncateText(value.idToLabelMapper(t), true, 10) : '',
                  ),
                  // textposition: 'top center',
                }),
          hovertext: value.validColumns[0].resolvedValues.map((v, i) =>
            `${value.idToLabelMapper(v.id)}
  ${(value.resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
  ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[i]?.val)}` : ''}
  ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[i].val)}` : ''}`.trim(),
          ),
          marker: {
            textfont: {
              color: VIS_NEUTRAL_COLOR,
            },
            color: value.colorColumn && mappingFunction ? value.colorColumn.resolvedValues.map((v) => mappingFunction(v.val)) : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? value.shapeColumn.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data,
      ];

      return traces;
    }

    if (facet && config && value && value.validColumns[0] && value.validColumns[1]) {
      const plots = facet.resultData.map((group) => {
        return {
          ...BASE_DATA,
          type: 'scattergl',
          x: group.data.x,
          y: group.data.y,
          xaxis: group.xref,
          yaxis: group.yref,
          mode: config.showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
          textposition: group.data.text.map((_, i) => textPositionOptions[i % textPositionOptions.length]),
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: group.data.text.map((t) => truncateText(value.idToLabelMapper(t), true, 10)),
                  // textposition: 'top center',
                }
              : {
                  text: group.data.text.map((t, i) => (selectedList.includes(group.data.ids[i]!) ? truncateText(value.idToLabelMapper(t), true, 10) : '')),
                  // textposition: 'top center',
                }),
          name: getLabelOrUnknown(group.data.facet),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => group.idToIndex.get(idx)).filter((v) => v !== undefined) }),
          hovertext: group.data.ids.map((p_id, index) =>
            `${value.idToLabelMapper(p_id)}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(p_id))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(group.data.color[index])}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(group.data.shape[index])}` : ''}`.trim(),
          ),
          marker: {
            color: value.colorColumn && mappingFunction ? group.data.color.map((v) => mappingFunction(v!)) : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? group.data.shape.map((shape) => shapeScale(shape as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data;
      });

      return plots;
    }

    if (splom) {
      // SPLOM case
      const plotlyDimensions = value.validColumns.map((col) => ({
        label: col.info.name,
        values: col.resolvedValues.map((v) => v.val),
      }));

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
          dimensions: plotlyDimensions,
          hovertext: value.validColumns[0].resolvedValues.map((v, i) =>
            `${value.idToLabelMapper(v.id)}
  ${(value.resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
  ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[i]?.val)}` : ''}
  ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[i].val)}` : ''}`.trim(),
          ),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => splom.idToIndex.get(idx)) }),
          marker: {
            color: value.colorColumn && mappingFunction ? value.colorColumn.resolvedValues.map((v) => mappingFunction(v.val)) : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? value.shapeColumn.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal, !!value.colorColumn),
        } as PlotlyTypes.Data,
      ];

      return traces;
    }

    return [];
  }, [status, value, subplots, scatter, config, facet, splom, selectedList, shapeScale, mappingFunction]);
}
