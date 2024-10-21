import * as React from 'react';
import { useElementSize } from '@mantine/hooks';
import debounce from 'lodash/debounce';
import h337 from 'heatmap.js';
import { scaleLinear } from 'd3v7';
import { clearDivChildren } from '../../../../util';
import { Molecule, Vertex } from '../../../../types/molecule.types';
import { StructureViewConfig } from '../../../../types/structure.types';
import { Gradient } from '../../../../types/gradient.types';
import { REFERENCE_HEIGHT, REFERENCE_WIDTH } from '../../../../modules/SingleView';

interface Props {
  molecule: Molecule;
  config: StructureViewConfig;
}

function adaptValueToBeOverThresholds(value: number, gradient: Gradient) {
  if (gradient.thresholds.length > 0) {
    const closeThreshold = gradient.thresholds.find((t) => value >= t - gradient.delta && value <= t + gradient.delta);
    if (closeThreshold) {
      if (closeThreshold <= value) {
        const newValue = closeThreshold + gradient.delta + 0.01;
        return newValue > 1 ? 1 : newValue;
      }
      const newValue = closeThreshold - gradient.delta - 0.01;
      return newValue < 0 ? 0 : newValue;
    }
  }
  return value;
}

function appendHeatmap(parent: HTMLElement, molecule: Molecule, gradient: Gradient) {
  const { colorDomain, blur, deadzone } = gradient;

  const { clientWidth, clientHeight } = parent;

  const scaleX = clientWidth / REFERENCE_WIDTH;
  const scaleY = clientHeight / REFERENCE_HEIGHT;

  //! heatmap does NOT need the vertex.contributions to be normalized.
  const vertices: Vertex[] = molecule.vertices!;

  const minDomain = colorDomain[0]; // !should be negative
  const midDomain = colorDomain[Math.round((colorDomain.length - 1) / 2)]; // !should be 0
  const maxDomain = colorDomain[colorDomain.length - 1]; // !should be positive

  // if all scores are zeros, it's a special case in terms of calculating the mapping function. To avoid a problem, se set the range to 0, 0.01.
  const allScoresAreZeros = molecule.method.scores.every((score) => score === 0);
  const minOpacity = allScoresAreZeros ? 0.0 : gradient.opacity.min;
  const maxOpacity = allScoresAreZeros ? 0.01 : gradient.opacity.max;

  const minRadius = gradient.radius.min / 2;
  const maxRadius = gradient.radius.max / 2;

  const heatmapPos = h337.create({
    container: parent,
    minOpacity,
    maxOpacity,
    radius: 10, // elements will have their own
    blur,
    gradient: gradient.colors.positive,
  });

  const heatmapNeg = h337.create({
    container: parent,
    minOpacity,
    maxOpacity,
    radius: 10,
    blur,
    gradient: gradient.colors.negative,
  });

  const heatmapScalerPos = scaleLinear()
    .domain([midDomain, midDomain + deadzone * (maxDomain - midDomain), maxDomain])
    .range([0, 0, 1]);

  function scalePos(value: number) {
    const v = heatmapScalerPos(value);
    if (v < 0) {
      return 0;
    }
    if (v > 1) {
      return 1;
    }
    return v;
  }

  const scaleRadiusPos = scaleLinear()
    .domain([midDomain, midDomain + deadzone * (maxDomain - midDomain), maxDomain])
    .range([minRadius, minRadius, maxRadius]);

  const radiusScalerPos = (value: number) => {
    const v = scaleRadiusPos(value);
    return v <= minRadius ? minRadius : v >= maxRadius ? maxRadius : v;
  };

  const elementsPos = vertices
    .filter((vertex: Vertex) => vertex.atomSmilesElement.score >= midDomain)
    .map((vertex: Vertex) => {
      return {
        x: Math.round(vertex.position.x * scaleX),
        y: Math.round(vertex.position.y * scaleY),
        value: adaptValueToBeOverThresholds(scalePos(vertex.atomSmilesElement.score), gradient),
        radius: radiusScalerPos(vertex.atomSmilesElement.score),
      };
    })
    .filter((vertex) => vertex.value !== 0);

  const heatmapScalerNeg = scaleLinear()
    .domain([minDomain, midDomain - deadzone * (midDomain - minDomain), midDomain])
    .range([1, 0, 0]);

  function scaleNeg(value: number) {
    const v = heatmapScalerNeg(value);
    if (v < 0) {
      return 0;
    }
    if (v > 1) {
      return 1;
    }
    return v;
  }

  const scaleRadiusNeg = scaleLinear()
    .domain([minDomain, midDomain - deadzone * (midDomain - minDomain), midDomain])
    .range([maxRadius, maxRadius, minRadius]);

  const radiusScalerNeg = (value: number) => {
    const v = scaleRadiusNeg(value);
    return v <= minRadius ? minRadius : v >= maxRadius ? maxRadius : v;
  };

  const elementsNeg = vertices
    .filter((vertex) => vertex.atomSmilesElement.score < midDomain)
    .map((vertex) => {
      return {
        x: Math.round(vertex.position.x * scaleX),
        y: Math.round(vertex.position.y * scaleY),
        value: adaptValueToBeOverThresholds(scaleNeg(vertex.atomSmilesElement.score), gradient),
        radius: radiusScalerNeg(vertex.atomSmilesElement.score),
      };
    })
    .filter((vertex) => vertex.value !== 0);

  heatmapPos.setData({
    min: 0,
    max: 1,
    data: elementsPos,
  });
  heatmapNeg.setData({
    min: 0,
    max: 1,
    data: elementsNeg,
  });
}

export function Heatmap2(props: Props) {
  const { ref, width, height } = useElementSize();

  const debouncedHeatmap = React.useMemo(() => {
    return debounce(
      (div, molecule, config) => {
        clearDivChildren(div);
        appendHeatmap(div, molecule, config.gradient);
      },
      200,
      {
        leading: true,
        trailing: true,
      },
    );
  }, []);

  React.useEffect(() => {
    const div = ref.current;
    const { molecule, config } = props;

    if (ref.current && width > 0 && height > 0) {
      debouncedHeatmap(div, molecule, config);
    }
  }, [ref, width, height, props, debouncedHeatmap]);

  return (
    <div style={{ position: 'absolute', zIndex: 0, width: '100%', height: '100%' }}>
      <div ref={ref} style={{ width: '100%', height: '100%', zIndex: 0, position: 'absolute' }} />
    </div>
  );
}
