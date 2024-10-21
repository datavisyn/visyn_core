import React from 'react';
import { ScrollArea, Stack } from '@mantine/core';
import { Method, Molecule as FullMolecule, RawMolecule } from '../types/molecule.types';
import { GradientConfig, GradientConfigOverwriteDefaults } from '../types/gradient.types';
import gradientsService from '../services/gradients.service';
import { Smiles2 } from '../components/molecule/smiles/Smiles';
import colorsService from '../services/colors.service';
import moleculeStructureService from '../services/molecule/molecule.structure.service';
import rdkitService from '../services/rdkit.service';
import { GVertex } from '../services/drawers/rdkitDrawer';
import { Highlight2 } from '../components/molecule/structure/layers/Highlight';
import { Heatmap2 } from '../components/molecule/structure/layers/HeatmapNew';
import { useDeepMemo } from '../../hooks';

// This is the reference size of the SVG mol where the vertices are getting drawn from
// This is used to scale the vertices to the actual size of the molecule
export const REFERENCE_WIDTH = 200;
export const REFERENCE_HEIGHT = 200;

export type MoleculeWithMethods = {
  string: string;
  sequence?: string[];
  methods: Method[];
  attributes: { [id: string]: number | string }; // attributes for each
};

export function SVGRenderer() {
  const [svg, setSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const genSvg = window.RDKit.get_mol('OCCc1c(C)[n+](cs1)Cc2cnc(C)nc2N').get_svg(250, 200);
    setSvg(genSvg);
  }, []);

  return <div>test</div>;
}

function updateColorMaps(gradientConfig: GradientConfig, molecule: RawMolecule) {
  const colorDomain = gradientsService.getColorDomainWithDefaultIfEmpty(gradientConfig, molecule.method.scores);
  gradientConfig.colorDomain = colorDomain;
  // colorDomain can be empty [] in the gradientConfig, here we want then to set a default behavior: calculate max |scores| and set it to -max, 0, max.
  // can be different from the actual domain of molecule.scores. if the gradient.domain is shorter than the molecule.scores values range, this will highlight the scores that are above/below the gradient.domain

  const gradient = gradientsService.getGradient(gradientConfig);
  const colorsRange = colorsService.setMidColorGray(gradient.palette.colors);
  // TODO move this to viewsConfig?
  return { gradient, colorDomain, colorsRange };
}

/**
 * Component that is exported as part of the library version of this project. App.tsx uses the same visualization and renders a webpage with specific functionalities, e.g. filtering, sorting, etc. XaiSmilesSingleView, on the other hand, is purposed to be exported and used in other systems, like in the Jupyter plugin designed to visualize the molecules in Jupyter notebooks too.
 * @param props Parameters to create the visualization of a molecule.
 * @returns Rendered interactive visualization encapsulated in a <div> element.
 */
export function SingleView({
  molecule,
  gradientConfig,
  showScoresOnStructure,
  showSmiles = true,
}: {
  molecule: RawMolecule;
  gradientConfig: GradientConfigOverwriteDefaults;
  showScoresOnStructure?: boolean;
  showSmiles?: boolean;
}) {
  const preprocessedMolecule = useDeepMemo(() => {
    return moleculeStructureService.preprocessSmilesElementsAndMethod(molecule);
  }, [molecule]);

  const svg = React.useMemo(() => {
    const details = {
      clearBackground: false,
      width: REFERENCE_WIDTH,
      height: REFERENCE_HEIGHT,
      bondLineWidth: 1.5,
      minFontSize: 8,
      maxFontSize: 16,
      annotationFontScale: 0.75,
    };

    const input = showScoresOnStructure ? moleculeStructureService.getCxSmilesWithScores(preprocessedMolecule) : molecule.string;

    return window.RDKit.get_mol(input).get_svg_with_highlights(JSON.stringify(details));
  }, [molecule.string, showScoresOnStructure, preprocessedMolecule]);

  const coordinates = React.useMemo(() => {
    return rdkitService.getAtomsCoordinatesFromSVG(svg);
  }, [svg]);

  const gVertices = React.useMemo(() => {
    const { smilesElements } = preprocessedMolecule;

    const vertices: GVertex[] = [];

    let i = 0;
    smilesElements.forEach((smilesElement) => {
      if (moleculeStructureService.smilesElementIsAtom(smilesElement)) {
        const coord = coordinates.find((e) => e.index === i)!;
        vertices.push({
          ...coord,
          smilesIndex: smilesElement.smilesIndex,
        });
        i += 1;
      }
    });

    rdkitService.setVerticesInMolecule(preprocessedMolecule, vertices);

    return vertices;
  }, [preprocessedMolecule, coordinates]);

  const [hoveredAtoms, setHoveredAtoms] = React.useState<number[]>([]);

  const preprocessedGradientConfig: GradientConfig = gradientsService.getGradientConfig(gradientConfig);

  const { gradient, colorDomain, colorsRange } = updateColorMaps(preprocessedGradientConfig, molecule);

  const structureViewConfig = { gradient };

  const onMouseMoveOverStructure = (event: MouseEvent, mol: FullMolecule) => {
    if (mol.vertices) {
      // Scale to reference size
      const target = event.target as HTMLElement;

      const scaleX = REFERENCE_WIDTH / target.clientWidth;
      const scaleY = REFERENCE_HEIGHT / target.clientHeight;

      const x = event.offsetX * scaleX;
      const y = event.offsetY * scaleY;

      const verticesWithDistance = mol.vertices
        .map((vertex) => {
          const dx = vertex.position.x - x;
          const dy = vertex.position.y - y;
          return { vertex, distance: Math.sqrt(dx * dx + dy * dy) };
        })
        .filter((v) => v.distance < 40)
        .sort((a, b) => a.distance - b.distance);

      if (verticesWithDistance.length > 0) {
        setHoveredAtoms([verticesWithDistance[0].vertex.atomIndex]);
      } else {
        setHoveredAtoms([]);
      }
    }
  };

  return (
    <Stack align="center" w="100%" h="100%">
      <div
        style={{
          position: 'relative',
          aspectRatio: '1/1',
          height: 0,
          flexGrow: 1,
          maxWidth: '100%',
          maxHeight: 250,
          minHeight: 100,
        }}
        onMouseMove={(event) => onMouseMoveOverStructure(event.nativeEvent, preprocessedMolecule)}
        onMouseOut={() => setHoveredAtoms([])}
      >
        <Heatmap2 molecule={preprocessedMolecule} config={structureViewConfig} />

        <img
          loading="lazy"
          alt={molecule.string}
          src={`data:image/svg+xml;base64,${btoa(svg)}`}
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        <Highlight2 hoverVertices={hoveredAtoms.map((hovered) => preprocessedMolecule.vertices[hovered])} config={structureViewConfig} />
      </div>

      {showSmiles ? (
        <ScrollArea w="100%" scrollbars="x">
          <div style={{ marginInline: 'auto', width: 'fit-content', height: 'fit-content' }}>
            <Smiles2
              atomHover={hoveredAtoms}
              setAtomHover={setHoveredAtoms}
              smilesString={molecule.string}
              smilesScores={molecule.method.scores}
              colorsDomain={colorDomain!} // if colorsDomain is undefined, showBarChart is false
              colorsRange={colorsRange}
              smilesElements={preprocessedMolecule.smilesElements!} // TODO now smilesElements contains scores, chars, etc... so this component's properties can be compacted
              alphaRange={[1, 1]}
              thresholds={preprocessedGradientConfig.thresholds.length ? gradientConfig.thresholds : [0.5, 1.0]}
            />
          </div>
        </ScrollArea>
      ) : null}
    </Stack>
  );
}

export default SingleView;
