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

  const colorScale = d3.scaleSequential(d3.interpolateGreys).domain([d3.max(kdeVal.map((val) => val[1] as number)), 0].reverse());

  // @ts-ignore
  const binWidth = useMemo(() => xScale(kdeVal[1][0]) - xScale(kdeVal[0][0]), [kdeVal, xScale]);
  console.log(kdeVal);
  return (
    <g>
      {kdeVal.map((val) => {
        return <rect key={val[0]} x={xScale(val[0])} y={margin.top} width={binWidth} height={height - margin.top} fill={colorScale(val[1])} />;
      })}
    </g>
  );
}
