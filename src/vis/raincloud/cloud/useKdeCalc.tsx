/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as d3 from 'd3v7';
import { op, table } from 'arquero';
import { useMemo } from 'react';

function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [
        x,
        d3.mean(V, function (v) {
          // @ts-ignore
          return kernel(x - v);
        }),
      ];
    });
  };
}
function kernelEpanechnikov(k) {
  return function (v) {
    // eslint-disable-next-line no-return-assign, no-cond-assign
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

/**
 * @param range
 * @param column
 * @returns xScale
 */
export function useKdeCalc({ values, xScale, ticks }: { values: number[]; xScale: d3.ScaleLinear<number, number>; ticks: number }) {
  const silvermansInfo: { variance: number; q1: number; q3: number } = useMemo(() => {
    return table({ values })
      .rollup({
        variance: op.variance('values'),
        q1: op.quantile('values', 0.25),
        q3: op.quantile('values', 0.75),
      })
      .objects()[0] as { variance: number; q1: number; q3: number };
  }, [values]);

  const kdeVal: [number, number][] = useMemo(() => {
    const kde = kernelDensityEstimator(
      kernelEpanechnikov(silvermans(silvermansInfo.q3 - silvermansInfo.q1, silvermansInfo.variance, values.length)),
      xScale.ticks(ticks),
    );

    return kde(values);
  }, [silvermansInfo, values, xScale, ticks]);

  return kdeVal;
}
