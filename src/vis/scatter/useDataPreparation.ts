import * as React from 'react';
import * as d3v7 from 'd3v7';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import isFinite from 'lodash/isFinite';
import { FetchColumnDataResult } from './utils';
import { columnNameWithDescription } from '../general/layoutUtils';
import { PlotlyTypes } from '../../plotly';
import { getCssValue } from '../../utils/getCssValue';
import { EColumnTypes, ENumericalColorScaleType } from '../interfaces';

function getStretchedDomains(x: number[], y: number[]) {
  let xDomain = d3v7.extent(x);
  let yDomain = d3v7.extent(y);

  if (xDomain[0] !== undefined && xDomain[1] !== undefined && yDomain[0] !== undefined && yDomain[1] !== undefined) {
    const xStretch = xDomain[1] - xDomain[0];
    const yStretch = yDomain[1] - yDomain[0];

    xDomain = [xDomain[0] - xStretch * 0.1, xDomain[1] + xStretch * 0.1];
    yDomain = [yDomain[0] - yStretch * 0.1, yDomain[1] + yStretch * 0.1];
  }

  return { xDomain, yDomain };
}

export function useDataPreparation({
  status,
  value,
  uniqueSymbols,
  numColorScaleType,
}: {
  status: string;
  value: FetchColumnDataResult;
  uniqueSymbols: string[];
  numColorScaleType: ENumericalColorScaleType;
}) {
  const subplots = React.useMemo(() => {
    if (!(status === 'success' && value.subplots && value.subplots.length > 0 && value.subplots[0])) {
      return undefined;
    }

    const ids = value.subplots[0].xColumn.resolvedValues.map((v) => v.id);
    const idToIndex = new Map<string, number>();
    ids.forEach((v, i) => {
      idToIndex.set(v, i);
    });

    const xyPairs = value.subplots.map((subplot, index) => {
      const x = subplot.xColumn.resolvedValues.map((v) => v.val as number);
      const y = subplot.yColumn.resolvedValues.map((v) => v.val as number);

      const validIndices = x.map((_, i) => (isFinite(x[i]) && isFinite(y[i]) ? i : null)).filter((i) => i !== null) as number[];

      const { xDomain, yDomain } = getStretchedDomains(x, y);

      return {
        x,
        y,
        xDomain,
        yDomain,
        xTitle: columnNameWithDescription(subplot.xColumn.info),
        yTitle: columnNameWithDescription(subplot.yColumn.info),
        validIndices,
        title: subplot.title,
        xref: `x${index > 0 ? index + 1 : ''}` as PlotlyTypes.XAxisName,
        yref: `y${index > 0 ? index + 1 : ''}` as PlotlyTypes.YAxisName,
      };
    });

    return { xyPairs, ids, text: ids, idToIndex };
  }, [status, value]);

  // Case when we have just a scatterplot
  const scatter = React.useMemo(() => {
    if (!(status === 'success' && value && value.validColumns.length === 2 && value.validColumns[0] && value.validColumns[1] && !value.facetColumn)) {
      return undefined;
    }

    // Get shared range for all plots
    const { xDomain, yDomain } = getStretchedDomains(
      value.validColumns[0].resolvedValues.map((v) => v.val as number),
      value.validColumns[1].resolvedValues.map((v) => v.val as number),
    );

    const ids = value.validColumns[0].resolvedValues.map((v) => v.id);

    const idToIndex = new Map<string, number>();
    ids.forEach((v, i) => {
      idToIndex.set(v, i);
    });

    const x = value.validColumns[0].resolvedValues.map((v) => v.val as number);
    const y = value.validColumns[1].resolvedValues.map((v) => v.val as number);

    return {
      plotlyData: {
        validIndices: x.map((_, i) => (isFinite(x[i]) && isFinite(y[i]) ? i : null)).filter((i) => i !== null) as number[],
        x,
        y,
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
    if (!(status === 'success' && value && value.validColumns.length > 2 && value.validColumns[0] && value.validColumns[1])) {
      return undefined;
    }

    const plotlyDimensions = value.validColumns.map((col) => ({
      label: columnNameWithDescription(col.info),
      values: col.resolvedValues.map((v) => v.val),
    }));

    // Split up data to xy plot pairs (for regression and subplots)
    const xyPairs: { data: { x: number[]; y: number[]; validIndices: number[] }; xref: PlotlyTypes.XAxisName; yref: PlotlyTypes.YAxisName }[] = [];

    for (let r = 0; r < value.validColumns.length; r++) {
      for (let c = 0; c < value.validColumns.length; c++) {
        // Only create lower triangular matrix
        if (r <= c) {
          continue;
        }

        const x = value.validColumns[c].resolvedValues.map((v) => v.val as number);
        const y = value.validColumns[r].resolvedValues.map((v) => v.val as number);

        xyPairs.push({
          data: {
            validIndices: x.map((_, i) => (isFinite(x[i]) && isFinite(y[i]) ? i : null)).filter((i) => i !== null) as number[],
            x,
            y,
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
      text: value.validColumns[0].resolvedValues.map((v) => v.id),
    };
  }, [status, value]);

  // Case when we have faceting
  const facet = React.useMemo(() => {
    if (!(status === 'success' && value && value.facetColumn && value.validColumns.length === 2 && value.validColumns[0] && value.validColumns[1])) {
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
    const { xDomain, yDomain } = getStretchedDomains(
      value.validColumns[0].resolvedValues.map((v) => v.val as number),
      value.validColumns[1].resolvedValues.map((v) => v.val as number),
    );

    const resultData = groupedData.map((grouped, index) => {
      const idToIndex = new Map<string, number>();
      grouped.forEach((v, vi) => {
        idToIndex.set(v.ids, vi);
      });

      const x = grouped.map((v) => v.x as number);
      const y = grouped.map((v) => v.y as number);

      return {
        data: {
          validIndices: x.map((_, i) => (isFinite(x[i]) && isFinite(y[i]) ? i : null)).filter((i) => i !== null) as number[],
          x,
          y,
          text: grouped.map((v) => v.ids),
          facet: grouped[0].facet,
          ids: grouped.map((v) => v.ids),
          color: grouped.map((v) => v.color),
          shape: grouped.map((v) => v.shape),
        },
        idToIndex,
        xref: `x${index > 0 ? index + 1 : ''}` as PlotlyTypes.XAxisName,
        yref: `y${index > 0 ? index + 1 : ''}` as PlotlyTypes.YAxisName,
      };
    });

    return {
      resultData,
      xTitle: columnNameWithDescription(value.validColumns[0].info),
      yTitle: columnNameWithDescription(value.validColumns[1].info),
      xDomain,
      yDomain,
      ids: value.validColumns[0].resolvedValues.map((v) => v.id),
    };
  }, [status, value]);

  const scales = React.useMemo(() => {
    if (!value) {
      return {
        color: undefined,
        shape: undefined,
      };
    }

    const shapeScale = value.shapeColumn
      ? d3v7
          .scaleOrdinal<string>()
          .domain(value.shapeColumn.resolvedValues.map((v) => v.val as string))
          .range(uniqueSymbols)
      : null;

    return {
      shape: shapeScale,
    };
  }, [uniqueSymbols, value]);

  return {
    splom,
    scatter,
    facet,
    subplots,
    shapeScale: scales.shape,
  };
}
