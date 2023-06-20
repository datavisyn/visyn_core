/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as d3 from 'd3v7';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisNumericalValue } from '../../interfaces';

/**
 * @param range
 * @param column
 * @returns xScale
 */
export function useXScale({
  range,
  column,
}: {
  range: [number, number];
  column: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes;
    info: ColumnInfo;
  };
}) {
  const xScale = React.useMemo(() => {
    const scale = d3
      .scaleLinear()
      .domain(d3.extent(column.resolvedValues.map((val) => val.val as number)))
      .range(range);

    return scale;
  }, [column, range]);

  return xScale;
}
