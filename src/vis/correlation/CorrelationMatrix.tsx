import * as React from 'react';
import { scaleBand, scaleLinear } from 'd3v7';
import { useMantineTheme } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import * as calculateCorrelation from 'calculate-correlation';
import { ICorrelationConfig, VisColumn } from '../interfaces';
import { useAsync } from '../../hooks/useAsync';
import { getCorrelationMatrixData } from './utils';
import { CircleCorrelationPair, CircleCorrelationPairProps } from './components/CircleCorrelationPair';
import { CorrelationPlotXAxis } from './components/CorrelationPlotAxis';

export function CorrelationMatrix({ config, columns }: { config: ICorrelationConfig; columns: VisColumn[] }) {
  const color = scaleLinear().domain([-1, 0, 1]).range(['#B22222', '#fff', '#000080']);
  const data = useAsync(getCorrelationMatrixData, [columns, config.numColumnsSelected]);

  const theme = useMantineTheme();
  const borderColor = theme.colors.gray[4];

  const [hover, setHover] = React.useState<{ xi: number; yi: number }>(undefined);

  const [ref, { width, height }] = useResizeObserver();

  const xScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    return scaleBand()
      .range([0, width])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [width, data]);

  const yScale = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;
    return scaleBand()
      .range([0, height])
      .domain(data.value.numericalColumns.map((column) => column.info.name));
  }, [height, data]);

  const memoized = React.useMemo(() => {
    if (!data?.value?.numericalColumns) return null;

    const cols = data.value.numericalColumns;

    for (let y = 1; y < cols.length; y++) {
      for (let x = 0; x < y; x++) {
        const correlation = calculateCorrelation(
          cols[x].resolvedValues.map((resolved) => resolved.val as number),
          cols[y].resolvedValues.map((resolved) => resolved.val as number),
        );

        console.log(x, y, correlation);
      }
    }

    return null;
  }, [data]);

  return null;

  //   const memoized = React.useMemo(() => {
  //     if (!data?.value?.numericalColumns) return null;

  //     const circles = [] as CircleCorrelationPairProps[];
  //     const texts = [] as { cx: number; cy: number; correlation: number }[];

  //     data.value.numericalColumns.forEach((column, i) => {
  //       const xname = column.info.name;

  //       data.value.numericalColumns.forEach((column2, j) => {
  //         const yname = column2.info.name;

  //         const correlation = calculateCorrelation(
  //           column.resolvedValues.map((resolved) => resolved.val as number),
  //           column2.resolvedValues.map((resolved) => resolved.val as number),
  //         );

  //         if (i > j) {
  //           circles.push({ cx: i, cy: j, correlation, xname: column.info.name, yname: column2.info.name });
  //         }
  //         if (j > i) {
  //           texts.push({ cx: xScale(xname) + xScale.bandwidth() / 2, cy: yScale(yname) + yScale.bandwidth() / 2, correlation });
  //         }
  //       });
  //     });

  //     return { circle: circles, text: texts };
  //   }, [xScale, yScale, data]);

  //   const colorScale = scaleLinear().domain([-1, 0, 1]).range(['#B22222', '#fff', '#000080']);

  //   return (
  //     <svg
  //       ref={ref}
  //       style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}
  //       onMouseMove={(event) => {
  //         const xi = Math.floor(event.nativeEvent.offsetX / (width / data.value.numericalColumns.length));
  //         const yi = Math.floor(event.nativeEvent.offsetY / (height / data.value.numericalColumns.length));
  //         setHover({ xi, yi });
  //       }}
  //       onMouseLeave={() => {
  //         setHover(undefined);
  //       }}
  //     >
  //       {data.value?.numericalColumns.map((column) => {
  //         return (
  //           <>
  //             <line x1={xScale(column.info.name) + 0.5} y1={0} x2={xScale(column.info.name) + 0.5} y2={height} stroke={borderColor} />
  //             <line x1={0} y1={yScale(column.info.name) + 0.5} x2={width} y2={yScale(column.info.name) + 0.5} stroke={borderColor} />
  //           </>
  //         );
  //       })}

  //       <line x1={width - 0.5} y1={0} x2={width - 0.5} y2={height} stroke={borderColor} />
  //       <line x1={0} y1={height - 0.5} x2={width} y2={height - 0.5} stroke={borderColor} />

  //       {data.value?.numericalColumns ? (
  //         <CorrelationPlotXAxis xScale={xScale} ticks={data?.value?.numericalColumns?.map((c) => ({ value: c.info.name, offset: 20 }))} />
  //       ) : null}

  //       {memoized?.circle.map((value) => {
  //         return (
  //           <CircleCorrelationPair
  //             key={`${value.cx}-${value.cy}`}
  //             hover={(value.cx === hover?.xi && value.cy === hover?.yi) || (value.cx === hover?.yi && value.cy === hover?.xi)}
  //             fill={colorScale(value.correlation)}
  //             value={value}
  //             xScale={xScale}
  //             yScale={yScale}
  //           />
  //         );
  //       })}
  //     </svg>
  //   );
}
