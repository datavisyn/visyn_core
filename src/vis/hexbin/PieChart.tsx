import * as React from 'react';
import { useMemo } from 'react';

import * as d3v7 from 'd3v7';
import uniqueId from 'lodash/uniqueId';

import { VIS_LABEL_COLOR } from '../general/constants';

export interface PieChartProps {
  data: number[];
  dataCategories: string[];
  radius: number;
  transform: string;
  colorScale: d3v7.ScaleOrdinal<string, string, never>;
  selected: {
    [key: string]: boolean;
  };
  isSelected: boolean;
}

export function PieChart({ data, dataCategories, radius, transform, colorScale, selected, isSelected }: PieChartProps) {
  const pie = useMemo(() => {
    return d3v7.pie();
  }, []);

  const createArc = useMemo(() => {
    return d3v7.arc().innerRadius(0).outerRadius(radius);
  }, [radius]);

  const id = React.useMemo(() => uniqueId('PieNum'), []);

  return (
    <g style={{ transform }}>
      {pie(data).map((slice, i) => {
        // TODO: Why are indexes bad in the key? how else to do this? Also, I think the typings for arc are wrong, which is why im typing slice to any
        // eslint-disable-next-line react/no-array-index-key
        return (
          <path
            key={`${id}, ${slice.startAngle}`}
            d={createArc(slice as any)}
            style={{
              fill: colorScale
                ? isSelected || Object.keys(selected).length === 0
                  ? colorScale(dataCategories[i])
                  : '#CED4DA'
                : isSelected || Object.keys(selected).length === 0
                  ? VIS_LABEL_COLOR
                  : '#CED4DA',
            }}
          />
        );
      })}
    </g>
  );
}
