import React, { useCallback, useMemo } from 'react';
import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import * as d3 from 'd3v7';

import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';

const margin = {
  top: 30,
  bottom: 0,
  left: 20,
  right: 20,
};

function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [
        x,
        d3.mean(V, function (v) {
          return kernel(x - v);
        }),
      ];
    });
  };
}
function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}

export function SplitViolin({
  numCol,
  config,
  width,
  height,
}: {
  numCol: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes;
    info: ColumnInfo;
  };
  config: IRaincloudConfig;
  width: number;
  height: number;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const kdeVal: [number, number][] = useMemo(() => {
    const kde = kernelDensityEstimator(kernelEpanechnikov(0.3), xScale.ticks(50));

    return kde(numCol.resolvedValues.map((val) => val.val as number));
  }, [numCol.resolvedValues, xScale]);

  const yScale = useMemo(() => {
    const scale = d3
      .scaleLinear()
      .domain([d3.max(kdeVal.map((val) => val[1] as number)), 0])
      .range([margin.top, height - margin.bottom]);

    return scale;
  }, [height, kdeVal]);

  const line = useMemo(() => {
    const myLine = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    return `${myLine(kdeVal)}L${xScale.range()[1]},${yScale.range()[1]}L${xScale.range()[0]},${yScale.range()[1]}Z`;
  }, [kdeVal, xScale, yScale]);
  return <path fill="lightgray" stroke="lightgray" strokeWidth={1} d={line} />;
}
