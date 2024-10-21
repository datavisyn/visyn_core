import * as React from 'react';
import { scaleLinear } from 'd3v7';
import SmilesChar from './SmilesChar';
import { SmilesElement } from '../../../types/molecule.types';
import moleculeGraphicService from '../../../services/molecule/molecule.graphic.service';

export function Smiles2({
  smilesString,
  thresholds = [0.5, 1],
  colorsDomain,
  colorsRange,
  alphaRange,
  smilesElements,
  smilesScores,
  atomHover,
  setAtomHover,
}: {
  smilesString: string;
  thresholds: number[];
  colorsDomain: number[];
  colorsRange: string[];
  alphaRange: number[];
  smilesElements: SmilesElement[];
  smilesScores: number[];
  atomHover: number[];
  setAtomHover: (atomHover: number[]) => void;
}) {
  const padding = 5;
  const charWidth = 16;
  const height = 100;
  const fontSize = 16;

  const paddingControl = 0.7;
  const graphicWidth = charWidth * paddingControl * smilesString.length + 4 * padding;

  const maxBarSize = height - 4 * fontSize;
  const barThresholdsScale01 = scaleLinear<number>().domain([0, 1]).range([0.25, maxBarSize]);

  return (
    <div style={{ lineHeight: `${height}px` }}>
      <svg
        style={{
          width: graphicWidth,
          height,
        }}
      >
        <g transform={`translate(${2 * padding},0)`}>
          <g>
            {thresholds.map((threshold) => (
              <line
                key={threshold}
                x1={-padding + fontSize / 4}
                y1={maxBarSize - barThresholdsScale01(threshold)}
                x2={charWidth * paddingControl * smilesElements.length + padding}
                y2={maxBarSize - barThresholdsScale01(threshold)}
                stroke="black"
                // strokeWidth={width / 2}
                opacity={0.1}
              />
            ))}
          </g>
          {smilesElements.map((smilesElement, i) => {
            return (
              <g
                key={smilesElement.smilesIndex}
                // onMouseOver={(event: MouseEvent) => this.onMouseOver(smilesElement)}
                onMouseOver={() => {
                  // Clear all hover
                  smilesElements.forEach((e) => {
                    e.vertex.hover = false;
                  });

                  // console.log(smilesElements);
                  moleculeGraphicService.setVerticesHoverStateBasedOnType(smilesElements, [smilesElement], true);

                  // console.log('hfljd');
                  // console.log(clonedSmilesElements);

                  const indices = smilesElements
                    .map((e) => [e.smilesIndex, e.vertex.hover])
                    .filter((e) => e[1])
                    .map((e) => e[0]) as number[];

                  // console.log('fdl');
                  setAtomHover(indices);
                }}
              >
                <SmilesChar
                  char={smilesElement.chars}
                  hover={smilesElement.vertex ? smilesElement.vertex.hover : false}
                  score={smilesScores[i]}
                  width={charWidth}
                  height={height}
                  x={i * (charWidth * paddingControl)}
                  fontSize={fontSize}
                  colorsDomain={colorsDomain}
                  colorsRange={colorsRange}
                  alphaRange={alphaRange}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
