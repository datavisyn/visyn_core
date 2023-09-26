import { Box, Chip, Container, ScrollArea, Stack, Tooltip } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import * as hex from 'd3-hexbin';
import { HexbinBin } from 'd3-hexbin';
import * as d3v7 from 'd3v7';
import { D3BrushEvent, D3ZoomEvent } from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EScatterSelectSettings } from '../interfaces';
import { SingleHex } from './SingleHex';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { IHexbinConfig } from './interfaces';
import { ResolvedHexValues } from './utils';

interface HexagonalBinProps {
  config: IHexbinConfig;
  allColumns: ResolvedHexValues;
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  filteredCategories: string[];
}

export function Hexplot({ config, allColumns, selectionCallback = () => null, selected = {}, filteredCategories }: HexagonalBinProps) {
  const { ref: hexRef, width: realWidth, height: realHeight } = useElementSize();

  const xZoomedScale = useRef<d3v7.ScaleLinear<number, number, never>>(null);
  const yZoomedScale = useRef<d3v7.ScaleLinear<number, number, never>>(null);
  const [xZoomTransform, setXZoomTransform] = useState(0);
  const [yZoomTransform, setYZoomTransform] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const id = React.useMemo(() => uniqueId('HexPlot'), []);

  // getting current categorical column values, original and filtered
  const currentColorColumn = useMemo(() => {
    if (config.color && allColumns.colorColVals) {
      return {
        allValues: allColumns.colorColVals.resolvedValues,
        filteredValues: allColumns.colorColVals.resolvedValues.filter((val) => !filteredCategories.includes(val.val as string)),
      };
    }

    return null;
  }, [allColumns?.colorColVals, config.color, filteredCategories]);

  const margin = useMemo(() => {
    return {
      left: 48,
      right: 16,
      top: 48,
      bottom: 48,
    };
  }, []);

  const height = realHeight - margin.top - margin.bottom;
  const width = realWidth - margin.left - margin.right;

  // getting currentX data values, both original and filtered.
  const currentX = useMemo(() => {
    if (allColumns) {
      if (config.color && allColumns.colorColVals) {
        return {
          allValues: allColumns.numColVals[0].resolvedValues,
          filteredValues: allColumns.numColVals[0].resolvedValues.filter((val, i) => {
            return !filteredCategories.includes(allColumns.colorColVals.resolvedValues[i].val as string);
          }),
        };
      }
      return {
        allValues: allColumns.numColVals[0].resolvedValues,
        filteredValues: allColumns.numColVals[0].resolvedValues,
      };
    }

    return null;
  }, [allColumns, config.color, filteredCategories]);

  // getting currentY data values, both original and filtered.
  const currentY = useMemo(() => {
    if (allColumns) {
      if (config.color && allColumns.colorColVals) {
        return {
          allValues: allColumns.numColVals[1].resolvedValues,
          filteredValues: allColumns.numColVals[1].resolvedValues.filter((val, i) => {
            return !filteredCategories.includes(allColumns.colorColVals.resolvedValues[i].val as string);
          }),
        };
      }
      return {
        allValues: allColumns.numColVals[1].resolvedValues,
        filteredValues: allColumns.numColVals[1].resolvedValues,
      };
    }

    return null;
  }, [allColumns, config.color, filteredCategories]);

  // create x scale
  const xScale = useMemo(() => {
    if (currentX?.allValues) {
      const min = d3v7.min<number>(currentX.allValues.map((c) => c.val as number));
      const max = d3v7.max<number>(currentX.allValues.map((c) => c.val as number));

      const newScale = d3v7
        .scaleLinear()
        .domain([min - min / 20, max + max / 20])
        .range([margin.left, margin.left + width]);

      return newScale;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentX?.allValues, width]);

  // create y scale
  const yScale = useMemo(() => {
    if (currentY?.allValues) {
      const min = d3v7.min<number>(currentY.allValues.map((c) => c.val as number));
      const max = d3v7.max<number>(currentY.allValues.map((c) => c.val as number));

      const newScale = d3v7
        .scaleLinear()
        .domain([min - min / 20, max + max / 20])
        .range([margin.top + height, margin.top]);

      return newScale;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentY?.allValues, height]);

  // creating d3 hexbin object to do hex math for me
  const d3Hexbin = useMemo(() => {
    return hex
      .hexbin()
      .radius(config.hexRadius)
      .extent([
        [0, 0],
        [width, height],
      ]);
  }, [config.hexRadius, height, width]);

  // generating the actual hexes
  const hexes: HexbinBin<[number, number, string, string]>[] = useMemo(() => {
    const inputForHexbin = [];

    if (currentX && currentY) {
      currentX.filteredValues.forEach((c, i) => {
        inputForHexbin.push([
          xScale(c.val as number),
          yScale(currentY.filteredValues[i].val as number),
          currentColorColumn ? currentColorColumn.filteredValues[i].val : '',
          c.id,
        ]);
      });
    }

    // TODO: Im cheating a bit here by appending the id/color value to each hex, breaking the types.
    // is there a better way to type this?
    return d3Hexbin(inputForHexbin) as unknown as HexbinBin<[number, number, string, string]>[];
  }, [currentColorColumn, currentX, d3Hexbin, xScale, yScale, currentY]);

  // simple radius scale for the hexes
  const radiusScale = useMemo(() => {
    const [min, max] = d3v7.extent(hexes, (h) => h.length);

    return d3v7
      .scaleLinear()
      .domain([min, max])
      .range([config.hexRadius / 2, config.hexRadius]);

    return null;
  }, [hexes, config.hexRadius]);

  // simple opacity scale for the hexes
  const opacityScale = useMemo(() => {
    const [min, max] = d3v7.extent(hexes, (h) => h.length);

    return d3v7.scaleLinear().domain([min, max]).range([0.1, 1]);

    return null;
  }, [hexes]);

  // Create a default color scale
  const colorScale = useMemo(() => {
    if (!currentColorColumn?.allValues) {
      return null;
    }

    const colorOptions = currentColorColumn.allValues.map((val) => val.val as string);

    return d3v7
      .scaleOrdinal<string, string>(allColumns.colorColVals.color ? Object.keys(allColumns.colorColVals.color) : d3v7.schemeCategory10)
      .domain(allColumns.colorColVals.color ? Object.values(allColumns.colorColVals.color) : Array.from(new Set<string>(colorOptions)));
  }, [allColumns, currentColorColumn]);

  // memoize the actual hexes since they do not need to change on zoom/drag
  const hexObjects = React.useMemo(() => {
    return (
      <>
        {hexes.map((singleHex) => {
          return (
            <SingleHex
              key={`${singleHex.x}, ${singleHex.y}`}
              selected={selected}
              hexbinOption={config.hexbinOptions}
              hexData={singleHex}
              d3Hexbin={d3Hexbin}
              isSizeScale={config.isSizeScale}
              radiusScale={radiusScale}
              isOpacityScale={config.isOpacityScale}
              opacityScale={opacityScale}
              hexRadius={config.hexRadius}
              colorScale={colorScale}
              isCategorySelected={!!config.color}
            />
          );
        })}
      </>
    );
  }, [
    colorScale,
    config.hexRadius,
    config.isOpacityScale,
    config.isSizeScale,
    d3Hexbin,
    hexes,
    opacityScale,
    radiusScale,
    selected,
    config.hexbinOptions,
    config.color,
  ]);

  // // apply zoom/panning
  useEffect(() => {
    const zoom = d3v7.zoom();

    if (!xScale || !yScale) {
      return;
    }

    zoom.on('zoom', (event: D3ZoomEvent<any, any>) => {
      const { transform } = event;

      const newX = transform.rescaleX(xScale);
      const newY = transform.rescaleY(yScale);

      xZoomedScale.current = newX;
      yZoomedScale.current = newY;

      setZoomScale(transform.k);
      setXZoomTransform(transform.x);
      setYZoomTransform(transform.y);
    });

    d3v7.select(`#${id}zoom`).call(zoom);
  }, [id, xScale, yScale, height, width]);

  // apply brushing
  useEffect(() => {
    // Since our brush doesnt persist after selection anyways, we can safely just do nothing
    if (config.dragMode !== EScatterSelectSettings.RECTANGLE) {
      return undefined;
    }

    const brush = d3v7.brush().extent([
      [margin.left, margin.top],
      [margin.left + width, margin.top + height],
    ]);

    d3v7.select(`#${id}brush`).call(
      // this is a real function and not a => so that I can use d3v7.select(this) inside to clear the brush
      brush.on('end', function (event: D3BrushEvent<any>) {
        if (!event.sourceEvent) return;
        if (!event.selection) {
          selectionCallback([]);
          return;
        }

        // To figure out if brushing is finding hexes after changing the axis via pan/zoom, need to do this.
        // Invert your "zoomed" scale to find the actual scaled values inside of your svg coords. Use the original scale to find the values.
        const startX = xZoomedScale.current ? xScale(xZoomedScale.current.invert(event.selection[0][0])) : event.selection[0][0];
        const startY = yZoomedScale.current ? yScale(yZoomedScale.current.invert(event.selection[0][1])) : event.selection[0][1];
        const endX = xZoomedScale.current ? xScale(xZoomedScale.current.invert(event.selection[1][0])) : event.selection[1][0];
        const endY = yZoomedScale.current ? yScale(yZoomedScale.current.invert(event.selection[1][1])) : event.selection[1][1];

        // to find the selected hexes
        const selectedHexes = hexes.filter((currHex) =>
          xZoomedScale.current
            ? currHex.x >= startX && currHex.x <= endX && currHex.y >= startY && currHex.y <= endY
            : currHex.x >= event.selection[0][0] &&
              currHex.x <= event.selection[1][0] &&
              currHex.y >= event.selection[0][1] &&
              currHex.y <= event.selection[1][1],
        );

        const allSelectedPoints = selectedHexes.map((currHex) => currHex.map((points) => points[3])).flat();

        selectionCallback(allSelectedPoints);

        d3v7.select(this).call(brush.move, null);
      }),
    );

    return () => {
      brush.on('end', null);
    };
  }, [width, height, id, hexes, selectionCallback, config.dragMode, xScale, yScale, margin]);

  return (
    <Box ref={hexRef}>
      <Container
        fluid
        pl={0}
        pr={0}
        sx={{
          height: height + margin.top + margin.bottom,
          width: '100%',
          '.overlay': {
            cursor: 'default !important',
          },
        }}
      >
        <svg id={id} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
          <defs>
            <clipPath id="clip">
              <rect style={{ transform: `translate(${margin.left}px, ${margin.top}px)` }} width={width} height={height} />
            </clipPath>
          </defs>
          <g clipPath="url(#clip)">
            <g id={`${id}brush`}>
              <g style={{ transform: `translate(${xZoomTransform}px, ${yZoomTransform}px) scale(${zoomScale})` }}>
                <g>{hexObjects}</g>
              </g>
            </g>
          </g>
          {xScale ? <XAxis vertPosition={height + margin.top} yRange={[margin.top, height + margin.top]} xScale={xZoomedScale.current || xScale} /> : null}
          {yScale ? <YAxis horizontalPosition={margin.left} xRange={[margin.left, width + margin.left]} yScale={yZoomedScale.current || yScale} /> : null}

          <text
            dominantBaseline="middle"
            textAnchor="middle"
            style={{
              transform: `translate(${margin.left + width / 2}px, ${margin.top + height + 30}px)`,
            }}
          >
            {allColumns?.numColVals[0]?.info.name}
          </text>
          <text
            dominantBaseline="middle"
            textAnchor="middle"
            style={{
              transform: `translate(10px, ${margin.top + height / 2}px) rotate(-90deg)`,
            }}
          >
            {allColumns?.numColVals[1]?.info.name}
          </text>
          <rect
            transform={`translate(${margin.left}, ${margin.top})`}
            id={`${id}zoom`}
            width={width}
            height={height}
            opacity={0}
            pointerEvents={config.dragMode === EScatterSelectSettings.PAN ? 'auto' : 'none'}
          />
        </svg>
      </Container>
    </Box>
  );
}
