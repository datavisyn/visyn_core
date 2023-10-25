/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as d3 from 'd3v7';
import { op, table } from 'arquero';
import { useMemo } from 'react';

const kernelDensityEstimator = (kernel: (n: number) => number, X: number[]) => {
  return (V: number[]) => X.map((x: number) => [x, d3.mean(V, (v: number) => kernel(x - v))]) as [number, number][];
};

const kernelEpanechnikov = (k: number) => (v: number) => {
  const newV = v / k;
  // TODO: @dv-usama-ansari: Check if this is correct
  return Math.abs(newV) <= 1 ? (0.75 * (1 - newV * newV)) / k : 0;
};

const toSampleVariance = (variance: number, len: number) => (variance * len) / (len - 1);

const silvermans = (iqr: number, variance: number, len: number) => {
  let s = Math.sqrt(toSampleVariance(variance, len));
  if (typeof iqr === 'number') {
    s = Math.min(s, iqr / 1.34);
  }
  return 1.06 * s * len ** -0.2;
};

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
