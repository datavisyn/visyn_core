import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { table, op } from 'arquero';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IScatterConfig } from '../interfaces';
import { getScatterData } from './utils';
import { Circle } from './components/Circle';
import { XAxis } from '../hexbin/XAxis';
import { YAxis } from '../hexbin/YAxis';

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
export function Scatterplot({ config, columns }: { config: IScatterConfig; columns: VisColumn[] }) {
  const { value: data } = useAsync(getScatterData, [columns, config.numColumnsSelected, config.color]);

  const [ref, { width, height }] = useResizeObserver();

  console.log(width, height);

  const xScale = useMemo(() => {
    if (!data) {
      return null;
    }

    return d3
      .scaleLinear()
      .range([0 + margin.left, width - margin.right])
      .domain(d3.extent(data.numericalColumns[0].resolvedValues.map((val) => val.val as number)));
  }, [data, width]);

  const yScale = useMemo(() => {
    if (!data) {
      return null;
    }

    return d3
      .scaleLinear()
      .range([height - margin.bottom, 0 + margin.top])
      .domain(d3.extent(data.numericalColumns[1].resolvedValues.map((val) => val.val as number)));
  }, [data, height]);

  const colorScale = useMemo(() => {
    if (!data) {
      return null;
    }

    return d3.scaleOrdinal(d3.schemeCategory10).domain(new Set(data.colorColumn.resolvedValues.map((val) => val.val as string)));
  }, [data]);

  const aggregatedTable = useMemo(() => {
    if (!data) {
      return null;
    }

    const myTable = table({
      x: data.numericalColumns[0].resolvedValues.map((val) => val.val as number),
      y: data.numericalColumns[1].resolvedValues.map((val) => val.val as number),
      color: data.colorColumn.resolvedValues.map((val) => val.val as string),
    });

    myTable.print();

    const groupedTable = myTable.groupby('color').rollup({ xMean: (d) => op.mean(d.x), yMean: (d) => op.mean(d.y) });

    groupedTable.print();

    return groupedTable;
  }, [data]);

  const circleLocations = useMemo(() => {
    if (!data) {
      return null;
    }

    return data.numericalColumns[0].resolvedValues.map((val, i) => {
      return {
        id: val.id,
        x: val.val as number,
        y: data.numericalColumns[1].resolvedValues[i].val as number,
        color: data.colorColumn.resolvedValues[i].val as string,
        xMean: (aggregatedTable.objects() as { xMean: number; yMean: number; color: string }[]).find(
          (row) => row.color === data.colorColumn.resolvedValues[i].val,
        )?.xMean,
        yMean: (aggregatedTable.objects() as { xMean: number; yMean: number; color: string }[]).find(
          (row) => row.color === data.colorColumn.resolvedValues[i].val,
        )?.yMean,
      };
    });
  }, [aggregatedTable, data]);

  console.log(circleLocations);

  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      {xScale && yScale ? <XAxis xScale={xScale} yRange={[yScale.range()[1], yScale.range()[0]]} vertPosition={height - margin.bottom} /> : null}
      {xScale && yScale ? <YAxis yScale={yScale} xRange={xScale.range()} horizontalPosition={margin.left} /> : null}

      <g>
        {circleLocations
          ? circleLocations.map((val) => {
              return (
                <Circle
                  r={config.aggregated ? 10 : 4}
                  opacity={config.alphaSliderVal}
                  key={val.id}
                  x={config.aggregated ? xScale(val.xMean) : xScale(val.x)}
                  y={config.aggregated ? yScale(val.yMean) : yScale(val.y)}
                  label={`${val.x}, ${val.y}, ${val.color}`}
                  color={colorScale(val.color)}
                />
              );
            })
          : null}
      </g>
    </svg>
  );
}
