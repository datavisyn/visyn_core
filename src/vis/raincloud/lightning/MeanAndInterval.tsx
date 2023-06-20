import React, { useCallback, useMemo } from 'react';
import { table, bin, op } from 'arquero';
import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import * as d3 from 'd3v7';

import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';

const margin = {
  top: 0,
  bottom: 0,
  left: 20,
  right: 20,
};

export function MeanAndInterval({
  numCol,
  config,
  width,
  height,
  yPos,
}: {
  numCol: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes;
    info: ColumnInfo;
  };
  config: IRaincloudConfig;
  width: number;
  height: number;
  yPos: number;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const vals = useMemo(() => {
    return table({ values: numCol.resolvedValues.map((v) => v.val) }).rollup({ mean: op.mean('values'), stdev: op.stdev('values') });
  }, [numCol.resolvedValues]);

  return (
    <g>
      {vals.objects().map((val: { mean: number; stdev: number }) => {
        return (
          <g key={val.mean}>
            <circle cx={xScale(val.mean)} r={8} fill="#f4c430" cy={yPos} />
            <line strokeLinecap="round" stroke="#f4c430" strokeWidth={5} x1={xScale(val.mean)} x2={xScale(val.mean - val.stdev)} y1={yPos} y2={yPos} />
            <line strokeLinecap="round" stroke="#f4c430" strokeWidth={5} x1={xScale(val.mean)} x2={xScale(val.mean + val.stdev)} y1={yPos} y2={yPos} />
          </g>
        );
      })}
    </g>
  );
}
