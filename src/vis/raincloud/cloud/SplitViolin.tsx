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

  const kdeVal = useKdeCalc({
    values: numCol.resolvedValues.map((val) => val.val as number),
    xScale,
    ticks: 50,
  });

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
  return <path fill="gray" stroke="gray" strokeWidth={1} d={line} />;
}
