import React, { useMemo } from 'react';
import * as d3 from 'd3v7';
import { table, op } from 'arquero';

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

function toSampleVariance(variance: number, len: number) {
  return (variance * len) / (len - 1);
}

function silvermans(iqr: number, variance: number, len: number) {
  let s = Math.sqrt(toSampleVariance(variance, len));
  if (typeof iqr === 'number') {
    s = Math.min(s, iqr / 1.34);
  }
  return 1.06 * s * len ** -0.2;
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

  const silvermansInfo: { variance: number; q1: number; q3: number } = useMemo(() => {
    return table({ values: numCol.resolvedValues.map((val) => val.val as number) })
      .rollup({
        variance: op.variance('values'),
        q1: op.quantile('values', 0.25),
        q3: op.quantile('values', 0.75),
      })
      .objects()[0] as { variance: number; q1: number; q3: number };
  }, [numCol.resolvedValues]);

  const kdeVal: [number, number][] = useMemo(() => {
    const kde = kernelDensityEstimator(
      kernelEpanechnikov(silvermans(silvermansInfo.q3 - silvermansInfo.q1, silvermansInfo.variance, numCol.resolvedValues.length)),
      xScale.ticks(25),
    );

    return kde(numCol.resolvedValues.map((val) => val.val as number));
  }, [numCol.resolvedValues, silvermansInfo.q1, silvermansInfo.q3, silvermansInfo.variance, xScale]);

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
