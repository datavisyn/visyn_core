import * as React from 'react';
import * as d3v7 from 'd3v7';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import { FetchColumnDataResult } from './utilsNew';
import { columnNameWithDescription } from '../general/layoutUtils';
import { PlotlyTypes } from '../../plotly';

export function useDataPreparation({ status, value }: { status: string; value: FetchColumnDataResult }) {
  // Case when we have just a scatterplot
  const scatter = React.useMemo(() => {
    if (!(status === 'success' && value && value.validColumns.length === 2 && !value.facetColumn)) {
      return undefined;
    }

    // Get shared range for all plots
    const xDomain = d3v7.extent(value.validColumns[0].resolvedValues.map((v) => v.val as number));
    const yDomain = d3v7.extent(value.validColumns[1].resolvedValues.map((v) => v.val as number));

    const ids = value.validColumns[0].resolvedValues.map((v) => v.id);

    const idToIndex = new Map<string, number>();
    ids.forEach((v, i) => {
      idToIndex.set(v, i);
    });

    return {
      plotlyData: {
        x: value.validColumns[0].resolvedValues.map((v) => v.val as number),
        y: value.validColumns[1].resolvedValues.map((v) => v.val as number),
        text: value.validColumns[0].resolvedValues.map((v) => v.id),
      },
      ids,
      xDomain,
      yDomain,
      xLabel: columnNameWithDescription(value.validColumns[0].info),
      yLabel: columnNameWithDescription(value.validColumns[1].info),
      idToIndex,
    };
  }, [status, value]);

  // Case when we have a scatterplot matrix
  const splom = React.useMemo(() => {
    if (!(status === 'success' && value && value.validColumns.length > 2)) {
      return undefined;
    }

    const plotlyDimensions = value.validColumns.map((col) => ({
      label: col.info.name,
      values: col.resolvedValues.map((v) => v.val),
    }));

    // Split up data to xy plot pairs (for regression and subplots)
    const xyPairs: { data: { x: number[]; y: number[] }; xref: PlotlyTypes.XAxisName; yref: PlotlyTypes.YAxisName }[] = [];

    for (let r = 0; r < value.validColumns.length; r++) {
      for (let c = 0; c < value.validColumns.length; c++) {
        xyPairs.push({
          data: {
            x: value.validColumns[c].resolvedValues.map((v) => v.val as number),
            y: value.validColumns[r].resolvedValues.map((v) => v.val as number),
          },
          xref: `x${c > 0 ? c + 1 : ''}` as PlotlyTypes.XAxisName,
          yref: `y${r > 0 ? r + 1 : ''}` as PlotlyTypes.YAxisName,
        });
      }
    }

    const ids = value.validColumns[0].resolvedValues.map((v) => v.id);
    const idToIndex = new Map<string, number>();
    ids.forEach((v, i) => {
      idToIndex.set(v, i);
    });

    return {
      dimensions: plotlyDimensions,
      idToIndex,
      xyPairs,
      ids,
    };
  }, [status, value]);

  // Case when we have faceting
  const facet = React.useMemo(() => {
    if (!(status === 'success' && value && value.facetColumn && value.validColumns.length === 2)) {
      return undefined;
    }

    const plotlyData = value.validColumns[0].resolvedValues.map((v, i) => ({
      x: v.val,
      y: value.validColumns[1].resolvedValues[i].val,
      ids: v.id?.toString(),
      facet: value.facetColumn.resolvedValues[i].val?.toString(),
      color: value.colorColumn ? value.colorColumn.resolvedValues[i].val : undefined,
      shape: value.shapeColumn ? value.shapeColumn.resolvedValues[i].val : undefined,
    }));

    const sortOrder =
      (value.facetColumn.domain as string[]) ||
      [...new Set(value.facetColumn.resolvedValues.map((v) => v.val as string))].sort((a, b) => a?.localeCompare(b, undefined, { sensitivity: 'base' }));

    const groupedData = sortBy(groupBy(plotlyData, 'facet'), (group) => {
      const facetValue = group[0].facet;
      const index = sortOrder.indexOf(facetValue);
      return index !== -1 ? index : Infinity;
    });

    // Get shared range for all plots
    const xDomain = d3v7.extent(value.validColumns[0].resolvedValues.map((v) => v.val as number));
    const yDomain = d3v7.extent(value.validColumns[1].resolvedValues.map((v) => v.val as number));

    const resultData = groupedData.map((grouped, i) => {
      const idToIndex = new Map<string, number>();
      grouped.forEach((v, vi) => {
        idToIndex.set(v.ids, vi);
      });

      return {
        data: grouped,
        idToIndex,
        xref: `x${i > 0 ? i + 1 : ''}` as PlotlyTypes.XAxisName,
        yref: `y${i > 0 ? i + 1 : ''}` as PlotlyTypes.YAxisName,
      };
    });

    return {
      resultData,
      xDomain,
      yDomain,
      ids: value.validColumns[0].resolvedValues.map((v) => v.id),
    };
  }, [status, value]);

  return {
    splom,
    scatter,
    facet,
  };
}
