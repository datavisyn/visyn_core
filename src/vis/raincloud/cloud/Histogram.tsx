import * as d3 from 'd3v7';
import React, { useMemo } from 'react';

import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { IRaincloudConfig } from '../utils';
import { useKdeCalc } from './useKdeCalc';

const margin = {
  top: 30,
  bottom: 0,
  left: 20,
  right: 20,
};

export function Histogram({
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
    ticks: 10,
  });

  const yScale = useMemo(() => {
    const scale = d3
      .scaleLinear()
      .domain([0, d3.max(kdeVal.map((val) => val[1] as number))])
      .range([margin.top, height - margin.bottom]);

    return scale;
  }, [height, kdeVal]);

  // @ts-ignore
  const binWidth = useMemo(() => xScale(kdeVal[1][0]) - xScale(kdeVal[0][0]), [kdeVal, xScale]);
  return (
    <g>
      {kdeVal.map(([location, density]) => {
        return (
          <rect
            fill="gray"
            key={location}
            x={xScale(location)}
            y={height - yScale(density) + margin.top}
            height={yScale(density) - margin.top}
            width={binWidth}
          />
        );
      })}
      ;
    </g>
  );
}
