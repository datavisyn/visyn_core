import React from 'react';
import chroma from 'chroma-js';
import { color } from 'd3-color';
import { StructureViewConfig } from '../../../../types/structure.types';
import { Vertex } from '../../../../types/molecule.types';

interface Props {
  hoverVertices: Vertex[];
  config: StructureViewConfig;
}

const getColor = (colors: string[], score: number) => {
  if (score < 0) {
    return colors[0];
  }
  if (score > 0) {
    return colors[colors.length - 1];
  }
  return '#d1d1d1';
};

function splitComplementaryFrom2Colors(color1: string, color2: string) {
  const hsl1 = chroma(color1).hsl();
  const hsl2 = chroma(color2).hsl();

  // get mid angle
  const maxAngle = Math.max(hsl1[0], hsl2[0]);
  const minAngle = Math.min(hsl1[0], hsl2[0]);
  const diffAngle = maxAngle - minAngle;
  let midAngle = maxAngle - diffAngle / 2;
  if (diffAngle < 180) {
    // small arc -> get the opposite
    midAngle += 180;
  }

  // console.log("HSL", hsl1, hsl2, maxAngle, minAngle, diffAngle, midAngle);
  return chroma.hsl(midAngle, (hsl1[1] + hsl2[1]) / 2, (hsl1[2] + hsl2[2]) / 2).hex();
}

export function Highlight2(props: Props) {
  const { colors } = props.config.gradient.palette;

  const delta = colors.length <= 5 ? 0 : colors.length === 7 ? 1 : colors.length === 9 ? 2 : 1;
  const circleStrokeColor = splitComplementaryFrom2Colors(colors[0 + delta], colors[colors.length - 1 - delta]);

  return (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {props.hoverVertices.map((vertex) => {
        const c = color(getColor(props.config.gradient.palette.colors, vertex.atomSmilesElement.score));
        c!.opacity = 0.6;

        return (
          <>
            <circle cx={vertex.position.x} cy={vertex.position.y} r={12} stroke={circleStrokeColor} strokeWidth={2} fill="transparent" />
            <circle cx={vertex.position.x} cy={vertex.position.y} r={10} stroke={c.formatRgb()} strokeWidth={2} fill="transparent" />
          </>
        );
      })}
    </svg>
  );
}
