import * as React from 'react';
import { scaleLinear } from 'd3v7';
import uniq from 'lodash/uniq';
import SmilesChar from './SmilesChar';
import { SmilesElement } from '../../../types/molecule.types';
import { isEmptyNullUndefined } from '../../../util';

function getElementsIfInAllBranches(smilesElements: SmilesElement[], branches: number[]) {
  const branch = smilesElements.filter((e) => {
    return branches.every((branchId) => {
      if (isEmptyNullUndefined(e.branchesIds)) {
        return false;
      }
      return e.branchesIds!.includes(branchId);
    });
  });
  return branch;
}

function inferHoveredAtomIndices(smilesElements: SmilesElement[], hoveredSmilesElement: SmilesElement) {
  if (hoveredSmilesElement.chars === '(' || hoveredSmilesElement.chars === ')') {
    const elementsInBranch = getElementsIfInAllBranches(smilesElements, hoveredSmilesElement.branchesIds || []);
    return uniq(elementsInBranch.map((e) => e.vertex.atomIndex));
  }

  if (!Number.isNaN(Number(hoveredSmilesElement.chars))) {
    const smilesElementsInRing = smilesElements.filter(
      (e) => hoveredSmilesElement.rings && hoveredSmilesElement.rings.some((c) => e.rings && e.rings.includes(c)),
    );
    return smilesElementsInRing.map((e) => e.vertex.atomIndex);
  }

  return hoveredSmilesElement.vertex ? [hoveredSmilesElement.vertex.atomIndex] : [];
}

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
        onMouseOut={() => {
          setAtomHover([]);
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
                onMouseOver={() => {
                  setAtomHover(inferHoveredAtomIndices(smilesElements, smilesElement));
                }}
              >
                <SmilesChar
                  char={smilesElement.chars}
                  hover={smilesElement.vertex ? atomHover.includes(smilesElement.vertex.atomIndex) : false}
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
