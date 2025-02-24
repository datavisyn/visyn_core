/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { css } from '@emotion/css';
import { Paper } from '@mantine/core';
import * as d3 from 'd3v7';
import map from 'lodash/map';

import { useCanvas, useTriggerFrame } from '../vis';
import { GottaCatchEmAll } from './Dataset';

const canvasStyle = css`
  width: 100%;
  height: 100%;
`;

const paperStyle = css`
  resize: both;
  overflow: hidden;
  width: 800px;
  height: 600px;
`;

function useDomains() {
  return React.useMemo(() => {
    const domainX = d3.extent(map(GottaCatchEmAll, 'sp_attack')) as [number, number];
    const domainY = d3.extent(map(GottaCatchEmAll, 'sp_defense')) as [number, number];
    return { domainX, domainY };
  }, []);
}

export function HandsOn1() {
  const { setRef, context: ctx, ratio: dpr, pixelContentWidth, pixelContentHeight, contentWidth, contentHeight } = useCanvas();

  const { domainX, domainY } = useDomains();

  const { scaleX, scaleY } = React.useMemo(() => {
    return {
      scaleX: d3.scaleLinear().domain(domainX).range([0, contentWidth]),
      scaleY: d3.scaleLinear().domain(domainY).range([contentHeight, 0]),
    };
  }, [contentHeight, contentWidth, domainX, domainY]);

  useTriggerFrame(() => {
    // Reset state
    ctx.reset();
    ctx.clearRect(0, 0, pixelContentWidth, pixelContentHeight);

    // Draw a cirlce
    GottaCatchEmAll.forEach((pokemon) => {
      const x = scaleX(pokemon.sp_attack) * dpr;
      const y = scaleY(pokemon.sp_defense) * dpr;

      ctx.beginPath();
      ctx.arc(x, y, 5 * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = d3.schemeTableau10[0]!;
      ctx.fill();
      ctx.closePath();
    });
  }, [ctx, dpr, pixelContentHeight, pixelContentWidth, scaleX, scaleY]);

  return (
    <Paper withBorder className={paperStyle}>
      <canvas ref={setRef} className={canvasStyle} width={pixelContentWidth} height={pixelContentHeight} />
    </Paper>
  );
}
