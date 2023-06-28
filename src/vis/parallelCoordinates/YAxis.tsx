import * as React from 'react';
import { useMemo } from 'react';
import * as d3v7 from 'd3v7';
import { Tooltip } from '@mantine/core';
import { YAxisTickLabel } from './YAxisTickLabels';
import { EColumnTypes } from '../interfaces';

// code taken from https://wattenberger.com/blog/react-and-d3
export function ParallelYAxis({
  id,
  yScale,
  xRange,
  horizontalPosition,
  type,
  axisLabel,
  onSelectionChanged,
}: {
  id: string;
  yScale: d3v7.ScaleLinear<number, number, never> | d3v7.ScaleBand<string>;
  xRange: number[];
  type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
  horizontalPosition: number | number;
  axisLabel: string;
  onSelectionChanged: (scaleId: string, selection: [number, number]) => void;
}) {
  const ref = React.useRef(null);
  const extent = useMemo(
    () =>
      [
        [horizontalPosition - 10, yScale.range()[1]],
        [horizontalPosition + 10, yScale.range()[0]],
      ] as [[number, number], [number, number]],
    [horizontalPosition, yScale],
  );

  React.useEffect(() => {
    if (extent && ref.current) {
      d3v7
        .select(ref.current)
        .attr('class', 'brush')
        .call(
          d3v7
            .brushY()
            .extent(extent)
            .on('brush end', (e) => onSelectionChanged(id, e.selection)),
        );
    }
  });

  const ticks = useMemo(() => {
    if (type === EColumnTypes.NUMERICAL) {
      return (yScale as d3v7.ScaleLinear<number, number, never>).ticks(5).map((value) => ({
        value,
        yOffset: yScale(value as any),
      }));
    }
    return (yScale as d3v7.ScaleBand<string>).domain().map((value) => ({
      value,
      // if we have a categorical column, we want to center the label
      yOffset: yScale(value as any) + (yScale as d3v7.ScaleBand<string>).bandwidth() / 2,
    }));
  }, [type, yScale]);

  const labelYOffset = 7; // offset for vertical position
  const labelXOffset = 40; // magic number to center label horizontally
  return (
    <>
      <Tooltip position="bottom" offset={15} withinPortal multiline label={axisLabel} color="dark">
        <text x={horizontalPosition - labelXOffset} y={yScale.range()[1] - labelYOffset}>
          {axisLabel}
        </text>
      </Tooltip>
      <g ref={ref} />
      <path
        transform={`translate(${horizontalPosition}, 0)`}
        d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')}
        fill="none"
        stroke="lightgray"
      />

      <path transform={`translate(${xRange[1]}, 0)`} d={['M', 0, yScale.range()[0], 'V', yScale.range()[1]].join(' ')} fill="none" stroke="lightgray" />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${yOffset})`}>
          <line x2="-6" stroke="currentColor" />
          <YAxisTickLabel value={value} />
        </g>
      ))}
    </>
  );
}
