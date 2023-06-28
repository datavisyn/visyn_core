import * as React from 'react';
import * as d3v7 from 'd3v7';
import { useResizeObserver } from '@mantine/hooks';
import { escape, table } from 'arquero';
import { useEffect, useMemo, useState } from 'react';
import { EColumnTypes, IParallelCoordinatesConfig, VisColumn } from '../interfaces';
import { ParallelYAxis } from './YAxis';

import { useAsync } from '../../hooks';
import { getParallelData } from './utils';
import { ParallelPath } from './ParallelPath';

const margin = {
  top: 30,
  right: 60,
  bottom: 10,
  left: 40,
};

export function ParallelPlot({
  columns,
  config,
  selectionCallback,
  selectedMap,
}: {
  config: IParallelCoordinatesConfig;
  columns: VisColumn[];
  selectionCallback: (ids: string[]) => void;
  selectedMap: Record<string, boolean>;
}) {
  const [ref, { width, height }] = useResizeObserver();
  const { value: allColumns } = useAsync(getParallelData, [columns, config?.numColumnsSelected, config?.catColumnsSelected]);

  const [hovered, setHovered] = React.useState<string>(null);

  const [brushes, setBrushes] = useState<Record<string, [number, number]>>({});

  const myTable = React.useMemo(() => {
    if (!allColumns) return null;

    const all = [...allColumns.numColVals, ...allColumns.catColVals];

    const dt = table({
      ...all.reduce((total, curr) => ({ ...total, [curr.info.id]: curr.resolvedValues.map((v) => v.val) }), {}),
      id: all[0]?.resolvedValues.map((v) => v.id),
    });

    return dt;
  }, [allColumns]);

  const yScales = React.useMemo(() => {
    if (!allColumns) return null;

    const all = [...allColumns.numColVals, ...allColumns.catColVals];

    const scales: Record<string, { axisLabel: string; type: EColumnTypes; scale: d3.ScaleLinear<number, number> | d3.ScalePoint<string> }> = {};

    all.forEach((col) => {
      let scale;
      if (col.type === EColumnTypes.NUMERICAL) {
        scale = d3v7
          .scaleLinear()
          .domain(d3v7.extent(col.resolvedValues.map((v) => v.val as number)))
          .range([height - margin.bottom, margin.top]);
      } else {
        scale = d3v7
          .scalePoint()
          .domain(col.resolvedValues.map((c) => c.val as string))
          .range([height - margin.bottom, margin.top]);
      }

      scales[col.info.id] = {
        axisLabel: col.info.name,
        type: col.type,
        scale,
      };
    });

    return scales;
  }, [allColumns, height]);

  const xScale = React.useMemo(() => {
    if (!allColumns) return null;

    const all = [...allColumns.numColVals, ...allColumns.catColVals];

    return d3v7
      .scalePoint()
      .domain(all.map((c) => c.info.id))
      .range([margin.left, width - margin.right]);
  }, [allColumns, width]);

  const paths: Record<string, string> = React.useMemo(() => {
    if (!myTable || !yScales || !xScale) return null;

    const myPaths: Record<string, string> = {};

    myTable.objects().forEach((row: { id: string } & Record<string, string | number>) => {
      let svgPath = 'M ';

      Object.keys(row).forEach((col) => {
        if (col === 'id') return;

        const xPos = xScale(col);
        const yPos = yScales[col].scale(row[col]);
        svgPath += `${xPos},${yPos} L`;
      });

      myPaths[row.id] = svgPath.slice(0, -2);
    });

    return myPaths;
  }, [myTable, xScale, yScales]);

  useEffect(() => {
    let filteredTable = myTable;
    if (!brushes) return;
    Object.keys(brushes).forEach((id) => {
      const range = brushes[id];
      if (range === null) return;
      const { scale } = yScales[id];

      if (yScales[id].type === EColumnTypes.CATEGORICAL) {
        const vals = yScales[id].scale.domain().filter((d) => yScales[id].scale(d) >= range[0] && yScales[id].scale(d) <= range[1]);

        console.log(vals);

        filteredTable = filteredTable.filter(escape((d) => vals.includes(d[id])));
      } else {
        const newRange = range.map((r) => (scale as d3.ScaleLinear<number, number>).invert(r));
        filteredTable = filteredTable.filter(escape((d) => d[id] >= newRange[1] && d[id] <= newRange[0]));
      }
    });

    const selectedIds = filteredTable?.objects().map((d: { id: string }) => d.id);
    selectionCallback(selectedIds);
  }, [brushes, myTable, selectionCallback, yScales]);

  return (
    <svg ref={ref} style={{ width: '100%', height: '100%' }}>
      {paths
        ? Object.keys(paths).map((pathId) => (
            <ParallelPath
              key={pathId}
              path={paths[pathId]}
              onHover={() => setHovered(pathId)}
              isSelected={selectedMap[pathId]}
              onLeave={() => setHovered(null)}
              hovered={hovered}
              id={pathId}
            />
          ))
        : null}
      {allColumns && yScales && xScale
        ? Object.keys(yScales).map((scaleId) => {
            return (
              <ParallelYAxis
                id={scaleId}
                onSelectionChanged={(id, range) => {
                  setBrushes((prev) => ({ ...prev, [id]: range }));
                }}
                key={scaleId}
                yScale={yScales[scaleId].scale}
                xRange={[margin.left, width + margin.left]}
                type={yScales[scaleId].type}
                axisLabel={yScales[scaleId].axisLabel}
                horizontalPosition={xScale(scaleId)}
              />
            );
          })
        : null}
    </svg>
  );
}
