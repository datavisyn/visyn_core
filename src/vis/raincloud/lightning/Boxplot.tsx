import React, { useCallback, useMemo } from 'react';
import { table, bin, op } from 'arquero';
import { Box, Container } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import * as d3 from 'd3v7';

import ColumnTable from 'arquero/dist/types/table/column-table';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';

const margin = {
  top: 0,
  bottom: 0,
  left: 20,
  right: 20,
};

const BOXHEIGHT = 10;

export function Boxplot({
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
    return baseTable.rollup({
      median: op.median('values'),
      firstQuartile: op.quantile('values', 0.25),
      thirdQuartile: op.quantile('values', 0.75),
      max: op.max('values'),
      min: op.min('values'),
    });
  }, [baseTable]);

  return (
    <g>
      {vals.objects().map((val: { median: number; firstQuartile: number; thirdQuartile: number; max: number; min: number }) => {
        return (
          <g key={val.median}>
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.median)} x2={xScale(val.median)} y1={yPos - BOXHEIGHT} y2={yPos + BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.median)} x2={xScale(val.firstQuartile) - 2} y1={yPos - BOXHEIGHT} y2={yPos - BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.median)} x2={xScale(val.firstQuartile) - 2} y1={yPos + BOXHEIGHT} y2={yPos + BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.median)} x2={xScale(val.thirdQuartile) + 2} y1={yPos - BOXHEIGHT} y2={yPos - BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.median)} x2={xScale(val.thirdQuartile) + 2} y1={yPos + BOXHEIGHT} y2={yPos + BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.firstQuartile)} x2={xScale(val.min)} y1={yPos} y2={yPos} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.thirdQuartile)} x2={xScale(val.thirdQuartile)} y1={yPos - BOXHEIGHT} y2={yPos + BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.firstQuartile)} x2={xScale(val.firstQuartile)} y1={yPos - BOXHEIGHT} y2={yPos + BOXHEIGHT} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.firstQuartile)} x2={xScale(val.min)} y1={yPos} y2={yPos} />
            <line stroke="#f4c430" strokeWidth={4} x1={xScale(val.thirdQuartile)} x2={xScale(val.max)} y1={yPos} y2={yPos} />
          </g>
        );
      })}
    </g>
  );
}
