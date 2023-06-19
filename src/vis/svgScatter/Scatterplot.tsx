import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { table, op } from 'arquero';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IScatterConfig } from '../interfaces';
import { getScatterData } from './utils';
import { XAxis } from '../hexbin/XAxis';
import { YAxis } from '../hexbin/YAxis';
import { Circle } from './components/Circle';

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

export function Scatterplot({ config, columns }: { config: IScatterConfig; columns: VisColumn[] }) {
  const { value: data } = useAsync(getScatterData, [columns, config.numColumnsSelected, config.color]);

  const [ref, { width, height }] = useResizeObserver();

  const xScale = useMemo(() => {
    if (!data) return null;

    return d3
      .scaleLinear()
      .range([margin.left, width - margin.right])
      .domain(d3.extent(data.numericalColumns[0].resolvedValues.map((val) => val.val as number)));
  }, [data, width]);

  const yScale = useMemo(() => {
    if (!data) return null;

    return d3
      .scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain(d3.extent(data.numericalColumns[1].resolvedValues.map((val) => val.val as number)));
  }, [data, height]);

  const colorScale = useMemo(() => {
    if (!data) return null;

    return d3
      .scaleOrdinal()
      .range(d3.schemeCategory10)
      .domain(data.colorColumn.resolvedValues.map((val) => val.val as string));
  }, [data]);

  const aggregatedTable = useMemo(() => {
    if (!data) return null;
    const myTable = table({
      x: data?.numericalColumns[0].resolvedValues.map((val) => val.val as number),
      y: data?.numericalColumns[1].resolvedValues.map((val) => val.val as number),
      color: data?.colorColumn.resolvedValues.map((val) => val.val as string),
    });

    return myTable.groupby('color').rollup({ xMean: (d) => op.mean(d.x), yMean: (d) => op.mean(d.y) });
  }, [data]);

  const circlePositions = useMemo(() => {
    if (!data) return null;

    return data.numericalColumns[0].resolvedValues.map((val, i) => ({
      id: val.id,
      x: val.val as number,
      y: data.numericalColumns[1].resolvedValues[i].val as number,
      color: data.colorColumn.resolvedValues[i].val as string,
      aggregatedX: (aggregatedTable.objects() as { color: string; xMean: number; yMean: number }[]).find(
        (obj) => obj.color === (data.colorColumn.resolvedValues[i].val as string),
      )?.xMean,
      aggregatedY: (aggregatedTable.objects() as { color: string; xMean: number; yMean: number }[]).find(
        (obj) => obj.color === (data.colorColumn.resolvedValues[i].val as string),
      )?.yMean,
    }));
  }, [aggregatedTable, data]);

  aggregatedTable?.print();

  console.log(circlePositions);

  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      {xScale && yScale ? <XAxis xScale={xScale} yRange={[yScale.range()[1], yScale.range()[0]]} vertPosition={height - margin.bottom} /> : null}
      {xScale && yScale ? <YAxis yScale={yScale} xRange={xScale.range()} horizontalPosition={margin.left} /> : null}

      {circlePositions?.map((circle) => {
        return (
          <Circle
            radius={config.aggregated ? 10 : 4}
            key={circle.id}
            x={config.aggregated ? xScale(circle.aggregatedX) : xScale(circle.x)}
            y={config.aggregated ? yScale(circle.aggregatedY) : yScale(circle.y)}
            label={`${circle.x}, ${circle.y}, ${circle.color}`}
            opacity={config.alphaSliderVal}
            color={colorScale(circle.color) as string}
          />
        );
      })}
    </svg>
  );
}
