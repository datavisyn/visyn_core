/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { css } from '@emotion/css';
import { Paper, Tooltip } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import * as d3 from 'd3v7';
import map from 'lodash/map';

import { SVGBrush, SVGLasso, m4, useBrush, useCanvas, useLasso, usePan, useTransformScale, useTriggerFrame, useZoom } from '../vis';
import { GottaCatchEmAll } from './Dataset';

const gridStyle = css`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 16px;
`;

const canvasStyle = css`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const paperStyle = css`
  position: relative;
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

export function HandsOn3() {
  const { setRef: setCanvasRef, context: ctx, ratio: dpr, pixelContentWidth, pixelContentHeight, contentWidth, contentHeight } = useCanvas();

  const { domainX, domainY } = useDomains();

  const [transform, setTransform] = React.useState(() => m4.identityMatrix4x4());

  const { ref, setRef: setPanRef } = usePan({
    value: transform,
    onChange: setTransform,
    direction: 'xy',
    constraint: (value) => value,
    skip: true,
  });

  const { setRef: setZoomRef } = useZoom({
    value: transform,
    onChange: setTransform,
    direction: 'xy',
    constraint: (value) => value,
  });

  const { setRef: setLassoRef, value: lasso } = useLasso({ skip: true });

  const { setRef: setBrushRef, value: brush, setValue: setBrush } = useBrush({ persistMode: 'clear_on_mouse_up' });

  const scaleX = useTransformScale({ domain: domainX, range: [0, contentWidth], transform, direction: 'x' });
  const scaleY = useTransformScale({ domain: domainY, range: [contentHeight, 0], transform, direction: 'y' });

  const mergedRef = useMergedRef(setPanRef, setZoomRef, setLassoRef, setBrushRef);

  const [hover, setHover] = React.useState<{
    index: number;
    x: number;
    y: number;
  }>();

  useTriggerFrame(() => {
    if (!scaleX || !scaleY) {
      return;
    }

    // Reset state
    ctx.reset();
    ctx.clearRect(0, 0, pixelContentWidth, pixelContentHeight);

    ctx.globalAlpha = 0.5;

    // Draw a cirlce
    GottaCatchEmAll.forEach((pokemon, index) => {
      const x = scaleX.scaled(pokemon.sp_attack) * dpr;
      const y = scaleY.scaled(pokemon.sp_defense) * dpr;

      ctx.beginPath();
      ctx.arc(x, y, 5 * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = index === hover?.index ? d3.schemeTableau10[1]! : d3.schemeTableau10[0]!;
      ctx.fill();
      ctx.closePath();
    });
  }, [ctx, dpr, hover?.index, pixelContentHeight, pixelContentWidth, scaleX, scaleY]);

  return (
    <Paper withBorder className={paperStyle}>
      <canvas ref={setCanvasRef} className={canvasStyle} width={pixelContentWidth} height={pixelContentHeight} />

      <svg
        ref={mergedRef}
        className={canvasStyle}
        onMouseMove={(event) => {
          if (!scaleX || !scaleY) {
            return;
          }

          // Get nearest point
          const x = event.nativeEvent.offsetX;
          const y = event.nativeEvent.offsetY;
          const dX = scaleX.scaled.invert(x);
          const dY = scaleY.scaled.invert(y);

          // Find nearest index in GottaCatchEmAll
          let index = -1;
          let minDist = Infinity;
          GottaCatchEmAll.forEach((pokemon, i) => {
            const dist = Math.hypot(dX - pokemon.sp_attack, dY - pokemon.sp_defense);
            if (dist < minDist) {
              minDist = dist;
              index = i;
            }
          });

          setHover(index !== -1 ? { index, x, y } : undefined);
        }}
        onMouseLeave={() => {
          setHover(undefined);
        }}
      >
        {lasso ? <SVGLasso value={lasso} /> : null}
        {brush ? <SVGBrush parent={ref} value={brush} onChange={setBrush} /> : null}
      </svg>

      {hover ? (
        <Tooltip
          offset={50}
          label={
            <div className={gridStyle}>
              <div>sp_attack</div>
              <div>{GottaCatchEmAll[hover.index]!.sp_attack}</div>
              <div>sp_defense</div>
              <div>{GottaCatchEmAll[hover.index]!.sp_defense}</div>
            </div>
          }
          opened
        >
          <div style={{ position: 'absolute', left: hover.x, top: hover.y, width: 0, height: 0 }} />
        </Tooltip>
      ) : undefined}
    </Paper>
  );
}
