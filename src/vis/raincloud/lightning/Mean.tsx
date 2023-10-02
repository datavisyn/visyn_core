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

export function Mean({
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
    return baseTable.rollup({ mean: op.mean('values') });
  }, [baseTable]);

  return (
    <g>
      {vals.objects().map((val: { mean: number }) => {
        return (
          <g key={val.mean}>
            <circle cx={xScale(val.mean)} r={8} fill="#f4c430" cy={yPos} />
          </g>
        );
      })}
    </g>
  );
}
