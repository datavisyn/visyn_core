import * as React from 'react';
import * as d3v7 from 'd3v7';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import isFinite from 'lodash/isFinite';
import { FetchColumnDataResult } from './utils';
import { columnNameWithDescription } from '../general/layoutUtils';
import { PlotlyTypes } from '../../plotly';
import { getCssValue } from '../../utils/getCssValue';
import { ENumericalColorScaleType } from '../interfaces';

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
  // Case when we have just a scatterplot
  const scatter = React.useMemo(() => {
    if (!(status === 'success' && value && value.validColumns.length === 2 && value.validColumns[0] && value.validColumns[1] && !value.facetColumn)) {
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
    if (!(status === 'success' && value && value.validColumns.length > 2)) {
      return undefined;
    }

    const plotlyDimensions = value.validColumns.map((col) => ({
      label: col.info.name,
      values: col.resolvedValues.map((v) => v.val),
    }));

    // Split up data to xy plot pairs (for regression and subplots)
    const xyPairs: { data: { x: number[]; y: number[]; validIndices: number[] }; xref: PlotlyTypes.XAxisName; yref: PlotlyTypes.YAxisName }[] = [];

    for (let r = 0; r < value.validColumns.length; r++) {
      for (let c = 0; c < value.validColumns.length; c++) {
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

    const numericalColorScale = value.colorColumn
      ? d3v7
          .scaleLinear<string, number>()
          .domain([value.colorDomain[1], (value.colorDomain[0] + value.colorDomain[1]) / 2, value.colorDomain[0]])
          .range(
            numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
              ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
              : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')],
          )
      : null;

    const shapeScale = value.shapeColumn
      ? d3v7
          .scaleOrdinal<string>()
          .domain(value.shapeColumn.resolvedValues.map((v) => v.val as string))
          .range(uniqueSymbols)
      : null;

    return {
      color: numericalColorScale,
      shape: shapeScale,
    };
  }, [numColorScaleType, uniqueSymbols, value]);

  return {
    splom,
    scatter,
    facet,
    shapeScale: scales.shape,
    colorScale: scales.color,
  };
}
