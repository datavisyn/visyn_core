import React, { useEffect, useMemo } from 'react';

import { table, op, bin } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { Circle } from './Circle';

const margin = {
  top: 30,
  bottom: 20,
  left: 20,
  right: 20,
};

export function StripPlot({
  numCol,
  config,
  width,
  height,
  yPos,
  baseTable,
  circleCallback,
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

  circleCallback: (circles: { id: string; x: number; y: number }[]) => void;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });
  useEffect(() => {
    const circles = baseTable.objects().map((singlePoint: { values: number; ids: string }) => {
      return { id: singlePoint.ids, x: xScale(singlePoint.values), y: yPos + margin.top };
    });

    circleCallback(circles.flat());
  }, [baseTable, circleCallback, xScale, yPos]);

  return null;
}
