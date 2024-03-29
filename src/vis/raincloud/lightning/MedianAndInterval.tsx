import { op } from 'arquero';
import React, { useMemo } from 'react';

import ColumnTable from 'arquero/dist/types/table/column-table';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { IRaincloudConfig } from '../interfaces';

const margin = {
  top: 0,
  bottom: 0,
  left: 20,
  right: 20,
};

export function MedianAndInterval({
  numCol,
  config,
  width,
  height,
  yPos,
  baseTable,
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
  baseTable: ColumnTable;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const vals = useMemo(() => {
    return baseTable.rollup({ median: op.median('values'), stdev: op.stdev('values') });
  }, [baseTable]);

  return (
    <g>
      {vals.objects().map((val: { median: number; stdev: number }) => {
        return (
          <g key={val.median}>
            <circle cx={xScale(val.median)} r={8} fill="#f4c430" cy={yPos} />
            <line strokeLinecap="round" stroke="#f4c430" strokeWidth={10} x1={xScale(val.median)} x2={xScale(val.median - val.stdev)} y1={yPos} y2={yPos} />
            <line strokeLinecap="round" stroke="#f4c430" strokeWidth={10} x1={xScale(val.median)} x2={xScale(val.median + val.stdev)} y1={yPos} y2={yPos} />
            <line strokeLinecap="round" stroke="#f4c430" strokeWidth={6} x1={xScale(val.median)} x2={xScale(val.median - val.stdev * 2)} y1={yPos} y2={yPos} />
            <line strokeLinecap="round" stroke="#f4c430" strokeWidth={6} x1={xScale(val.median)} x2={xScale(val.median + val.stdev * 2)} y1={yPos} y2={yPos} />
          </g>
        );
      })}
    </g>
  );
}
