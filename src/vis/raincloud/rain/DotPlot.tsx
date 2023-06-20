import React, { useMemo } from 'react';

import { table, op } from 'arquero';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';

const margin = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};

export function DotPlot({
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

  // const yScale = useMemo(() => {
  //   const scale = d3
  //     .scaleLinear()
  //     .domain([d3.max(kdeVal.map((val) => val[1] as number)), 0])
  //     .range([margin.top, height - margin.bottom]);

  //   return scale;
  // }, [height, kdeVal]);

  const dt = useMemo(() => {
    return table({ values: numCol.resolvedValues.map((v) => v.val) }).rollup({ bins: (d) => op.bins(d.values) });
  }, [numCol.resolvedValues]);
  dt.print();
  return null;
  // return <path fill="cornflowerblue" stroke="cornflowerblue" strokeWidth={1} d={line} />;
}
