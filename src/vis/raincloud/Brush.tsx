import * as d3 from 'd3v7';
import React, { useEffect } from 'react';

export function Brush({
  x,
  y,
  height,
  width,
  id,
  onBrush,
}: {
  y: number;
  x: number;
  height: number;
  width: number;
  id: string;
  onBrush: (brushArea: [number, number]) => void;
}) {
  useEffect(() => {
    const brush = d3
      .brushX()
      .extent([
        [x, y],
        [x + width, y + height],
      ])
      .on('brush', (e) => {
        onBrush(e.selection as [number, number]);
      })
      .on('end', (e) => {
        if (!e.selection) {
          onBrush(null);
        }
      });

    d3.select(`#brush${id}`).call(brush);
  }, [height, id, onBrush, width, x, y]);

  return <g id={`brush${id}`} />;
}
