import { Box, Container, Text, Center, rem } from '@mantine/core';
import { useElementSize, useMergedRef } from '@mantine/hooks';
import * as hex from 'd3-hexbin';
import { HexbinBin } from 'd3-hexbin';
import * as d3v7 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { EScatterSelectSettings } from '../interfaces';
import { SingleHex } from './SingleHex';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { IHexbinConfig } from './interfaces';
import { ResolvedHexValues } from './utils';
import { checkForInclusion, lassoToSvgPath, m4, useLasso, useLinearScale, usePan, useTransformScale, useZoom } from '../vishooks';
import { sxi, txi, tyi } from '../vishooks/math/matrix4x4';
import { VIS_AXIS_LABEL_SIZE, VIS_AXIS_LABEL_SIZE_SMALL, VIS_LABEL_COLOR } from '../general/constants';

interface HexagonalBinProps {
  config: IHexbinConfig;
  allColumns: ResolvedHexValues;
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  filteredCategories: string[];
  colorScale: d3v7.ScaleOrdinal<string, string>;
  multiples?: boolean;
}

export function Hexplot({ config, allColumns, selectionCallback = () => null, selected = {}, filteredCategories, multiples, colorScale }: HexagonalBinProps) {
  const { ref: hexRef, width: realWidth, height: realHeight } = useElementSize();
  const [transform, setTransform] = useState(m4.identityMatrix4x4());

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
      top: 0,
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
            return !filteredCategories.includes(`${allColumns.colorColVals.resolvedValues[i].val}` as string); // need to have a string, even if it's 'undefined' or 'null'
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

  const domains = useMemo(() => {
    return {
      x: d3v7.extent(currentX.allValues.map((c) => c.val as number)),
      y: d3v7.extent(currentY.allValues.map((c) => c.val as number)),
    };
  }, [currentX?.allValues, currentY?.allValues]);

  const { base: xBaseScale, scaled: xScale } = useTransformScale({
    domain: [domains.x[0] - domains.x[0] / 20, domains.x[1] + domains.x[1] / 20],
    range: [margin.left, margin.left + width],
    transform,
    direction: 'x',
  });

  const { base: yBaseScale, scaled: yScale } = useTransformScale({
    domain: [domains.y[0] - domains.y[0] / 20, domains.y[1] + domains.y[1] / 20],
    range: [margin.top + height, margin.top],
    transform,
    direction: 'y',
  });

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
          xBaseScale(c.val as number),
          yBaseScale(currentY.filteredValues[i].val as number),
          currentColorColumn ? currentColorColumn.filteredValues[i].val : '',
          c.id,
        ]);
      });
    }

    // TODO: Im cheating a bit here by appending the id/color value to each hex, breaking the types.
    // is there a better way to type this?
    return d3Hexbin(inputForHexbin) as unknown as HexbinBin<[number, number, string, string]>[];
  }, [currentColorColumn, currentX, d3Hexbin, xBaseScale, yBaseScale, currentY]);

  const hexDomains = useMemo(() => {
    return {
      len: d3v7.extent(hexes, (h) => h.length),
    };
  }, [hexes]);

  const radiusScale = useLinearScale({
    domain: hexDomains.len,
    range: [config.hexRadius / 2, config.hexRadius],
  });

  const opacityScale = useLinearScale({
    domain: hexDomains.len,
    range: [0.25, 1],
  });

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

  const { setRef: lassoSetRef, value } = useLasso({
    skip: config.dragMode !== EScatterSelectSettings.RECTANGLE,
    onChangeEnd: (lasso) => {
      if (lasso) {
        const domainLasso = lasso.map((point) => {
          return {
            x: xScale.invert(point.x),
            y: yScale.invert(point.y),
          };
        });

        const selectedHexes = hexes.filter((currHex) => {
          return checkForInclusion(domainLasso, {
            x: xBaseScale.invert(currHex.x),
            y: yBaseScale.invert(currHex.y),
          });
        });

        const allSelectedPoints = selectedHexes.map((currHex) => currHex.map((points) => points[3])).flat();

        selectionCallback(allSelectedPoints);
      } else {
        selectionCallback([]);
      }
    },
  });

  const { setRef: zoomSetRef } = useZoom({
    value: transform,
    onChange: setTransform,
    zoomExtent: [1, 10],
  });

  const { setRef: panSetRef } = usePan({
    value: transform,
    onChange: setTransform,
    skip: config.dragMode !== EScatterSelectSettings.PAN,
  });

  const mergedRef = useMergedRef(zoomSetRef, lassoSetRef, panSetRef);

  return (
    <Box ref={hexRef}>
      <Container
        fluid
        pl={0}
        pr={0}
        style={{
          height: height + margin.top + margin.bottom,
          width: '100%',
          '.overlay': {
            cursor: 'default !important',
          },
        }}
      >
        <svg id={id} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} ref={mergedRef}>
          {xScale ? <XAxis multiples={multiples} vertPosition={height + margin.top} yRange={[margin.top, height + margin.top]} xScale={xScale} /> : null}
          {yScale ? <YAxis multiples={multiples} horizontalPosition={margin.left} xRange={[margin.left, width + margin.left]} yScale={yScale} /> : null}

          <defs>
            <clipPath id="clip">
              <rect style={{ transform: `translate(${margin.left}px, ${margin.top}px)` }} width={width} height={height} />
            </clipPath>
          </defs>
          <g clipPath="url(#clip)">
            <g id={`${id}brush`}>
              <g style={{ transform: `translate(${transform[txi]}px, ${transform[tyi]}px) scale(${transform[sxi]})` }}>
                <g data-testid="hexObjects">{hexObjects}</g>
              </g>
            </g>
          </g>

          <g transform={`translate(${margin.left}, ${height + margin.top + 25})`}>
            <foreignObject width={Math.abs(xScale.range()[0] - xScale.range()[1])} height={20}>
              <Center>
                <Text data-testid="XAxisDescription" size={multiples ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)} c={VIS_LABEL_COLOR}>
                  {allColumns?.numColVals[0]?.info.name}
                </Text>
              </Center>
            </foreignObject>
          </g>

          <g transform={`translate(${margin.left - 45}, ${yScale.range()[0]}) rotate(-90)`}>
            <foreignObject height="20px" width={Math.abs(yScale.range()[0] - yScale.range()[1])}>
              <Center>
                <Text data-testid="YAxisDescription" size={multiples ? rem(VIS_AXIS_LABEL_SIZE_SMALL) : rem(VIS_AXIS_LABEL_SIZE)} c={VIS_LABEL_COLOR}>
                  {allColumns?.numColVals[1]?.info.name}
                </Text>
              </Center>
            </foreignObject>
          </g>

          {value ? <path d={lassoToSvgPath(value)} fill="none" stroke="black" strokeDasharray="4" strokeWidth={1} /> : null}
        </svg>
      </Container>
    </Box>
  );
}
