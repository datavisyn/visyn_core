import * as React from 'react';
import * as d3v7 from 'd3v7';
import { useResizeObserver } from '@mantine/hooks';
import { table } from 'arquero';
import { Tooltip } from '@mantine/core';
import { EColumnTypes, IParallelCoordinatesConfig, VisColumn } from '../interfaces';
import { ParallelYAxis } from './YAxis';

import { useAsync } from '../../hooks';
import { getParallelData } from './utils';
import { ParallelPath } from './ParallelPath';

const margin = {
  top: 30,
  right: 40,
  bottom: 10,
  left: 40,
};

const removeSpace = (col: string) => col.replace(' ', '');

export function ParallelPlot({ columns, config }: { config: IParallelCoordinatesConfig; columns: VisColumn[] }) {
  const [ref, { width, height }] = useResizeObserver();
  const { value: allColumns, status: colsStatus, error } = useAsync(getParallelData, [columns, config?.numColumnsSelected, config?.catColumnsSelected]);

  const [showTooltip, setShowTooltip] = React.useState<boolean>(false);
  const [tooltipContent, setTooltipContent] = React.useState<string>('');

  const rows = React.useMemo(() => {
    const all = [...(allColumns?.numColVals || []), ...(allColumns?.catColVals || [])];
    if (all.length === 0) return null;
    const dt = table(all.reduce((acc, col) => ({ ...acc, [removeSpace(col.info.name)]: col.resolvedValues.map((v) => v.val) }), {}));
    return dt.objects();
  }, [allColumns]);

  const onPathHover = React.useCallback(
    (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
      const { index } = e.currentTarget.dataset;
      setShowTooltip(true);
      setTooltipContent(
        Object.keys(rows[index])
          .map((label) => `${label}: ${rows[index][label]}`)
          .join('; '),
      );
    },
    [rows],
  );

  const onPathLeave = React.useCallback((e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    setShowTooltip(false);
  }, []);

  const yScales = React.useMemo(() => {
    const all = [...(allColumns?.numColVals || []), ...(allColumns?.catColVals || [])];
    if (all.length === 0) return null;
    return all?.map((col) => {
      let scale;
      if (col.type === EColumnTypes.NUMERICAL) {
        scale = d3v7
          .scaleLinear()
          .domain(d3v7.extent(col.resolvedValues.map((v) => v.val as number)))
          .range([height - margin.bottom, margin.top]);
      } else {
        scale = d3v7
          .scaleBand()
          .domain(col.resolvedValues.map((c) => c.val as string))
          .range([height, margin.top]);
        console.log('scale: ', scale.bandwidth());
      }
      return {
        id: removeSpace(col.info.name),
        axisLabel: col.info.name,
        type: col.type,
        scale,
      };
    });
  }, [allColumns, height]);

  const xScale = React.useMemo(() => {
    const all = [...(allColumns?.numColVals || []), ...(allColumns?.catColVals || [])];
    if (all.length === 0) return null;

    return d3v7
      .scaleBand()
      .domain(all.map((c) => removeSpace(c.info.name)))
      .range([margin.left, width - margin.right]);
  }, [allColumns?.catColVals, allColumns?.numColVals, width]);

  const paths = React.useMemo(() => {
    return rows?.map((r) => {
      if (!r) return null;
      const yPositions = Object.keys(r).map((col) => {
        const xPos = xScale(col);
        const yPos = yScales?.find((yScale) => yScale.id === col)?.scale(r[col]) || 0;
        return [xPos, yPos];
      });

      let svgPath = '';
      yPositions.forEach((yPos, i) => {
        if (i === 0) {
          svgPath += `M ${yPos[0]},${yPos[1]}`;
        } else {
          svgPath += `L ${yPos[0]},${yPos[1]}`;
        }
      });
      return svgPath;
    });
  }, [rows, xScale, yScales]);

  return (
    <Tooltip position="bottom" offset={15} withinPortal multiline label={tooltipContent} color="dark" opened={showTooltip}>
      <svg ref={ref} style={{ width: '100%', height: '100%' }}>
        {paths ? paths?.map((path, i) => <ParallelPath key={path + i} index={i} path={path} onHover={onPathHover} onLeave={onPathLeave} />) : null}
        {allColumns && yScales && xScale
          ? yScales.map((yScale) => {
              return (
                <ParallelYAxis
                  key={yScale.id}
                  yScale={yScale.scale}
                  xRange={[margin.left, width + margin.left]}
                  type={yScale.type}
                  axisLabel={yScale.axisLabel}
                  horizontalPosition={xScale(yScale.id)}
                />
              );
            })
          : null}
      </svg>
    </Tooltip>
  );
}
