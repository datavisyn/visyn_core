import * as d3 from 'd3v7';
import React, { useMemo } from 'react';

import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { IRaincloudConfig } from '../interfaces';
import { useKdeCalc } from './useKdeCalc';

const margin = {
  top: 30,
  bottom: 0,
  left: 20,
  right: 20,
};

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

  const kdeVal = useKdeCalc({
    values: numCol.resolvedValues.map((val) => val.val as number),
    xScale,
    ticks: 50,
  });

  const colorScale = useMemo(() => {
    return d3
      .scaleSequential(
        d3.piecewise(d3.interpolateRgb.gamma(2.2), [
          '#E9ECEF',
          '#DEE2E6',
          '#C8CED3',
          '#BCC3C9',
          '#ACB4BC',
          '#99A1A9',
          '#878E95',
          '#71787E',
          '#62686F',
          '#505459',
        ]),
      )
      .domain([0, d3.max(kdeVal.map((val) => val[1] as number))]);
  }, [kdeVal]);

  // @ts-ignore
  const binWidth = useMemo(() => xScale(kdeVal[1][0]) - xScale(kdeVal[0][0]), [kdeVal, xScale]);
  return (
    <g>
      {kdeVal.map((val) => {
        return (
          <rect
            key={val[0]}
            x={xScale(val[0])}
            y={height - (height > 100 + margin.top ? 100 : height - margin.top)}
            width={binWidth}
            height={height > 100 + margin.top ? 100 : height - margin.top}
            fill={colorScale(val[1])}
          />
        );
      })}
    </g>
  );
}
