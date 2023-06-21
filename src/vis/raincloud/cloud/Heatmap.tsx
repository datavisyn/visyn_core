import React, { useCallback, useMemo } from 'react';
import * as d3 from 'd3v7';

import { bin, op, table } from 'arquero';
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

export function Heatmap({
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
    const kde = kernelDensityEstimator(kernelEpanechnikov(0.3), xScale.ticks(100));

    return kde(numCol.resolvedValues.map((val) => val.val as number));
  }, [numCol.resolvedValues, xScale]);

  const bins = useMemo(() => {
    return table({ values: numCol.resolvedValues.map((v) => v.val) })
      .groupby('values', { bin: bin('values', { maxbins: 100 }) })
      .count()
      .groupby('bin')
      .rollup({ count: op.sum('count'), average: op.mean('values') })
      .orderby('bin');
  }, [numCol.resolvedValues]);

  const colorScale = d3.scaleSequential(d3.interpolateGreys).domain([d3.max(kdeVal.map((val) => val[1] as number)), 0]);

  // @ts-ignore
  const binWidth = useMemo(() => xScale(bins.objects()[1].bin) - xScale(bins.objects()[0].bin), [bins, xScale]);
  console.log(binWidth);
  console.log(bins.objects());
  return bins.objects().map((singleBin: { bin: number; count: number; average: number }) => {
    return <rect key={singleBin.bin} x={xScale(singleBin.bin)} y={0} width={binWidth} height={30} fill={colorScale(singleBin.count)} />;
  });
}
