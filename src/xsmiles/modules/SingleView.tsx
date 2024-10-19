import React from 'react';
import { Method, RawMolecule, Molecule as FullMolecule, Vertex } from '../types/molecule.types';
import { GradientConfig, GradientConfigOverwriteDefaults } from '../types/gradient.types';
import MoleculeViews from '../components/molecule/MoleculeViews';
import './SingleView.css';
import cloneDeep from 'lodash/cloneDeep';
import gradientsService from '../services/gradients.service';
import { DrawerType } from '../types/drawer.interface';
import Smiles, { Smiles2 } from '../components/molecule/smiles/Smiles';
import colorsService from '../services/colors.service';
import moleculeStructureService from '../services/molecule/molecule.structure.service';
import rdkitService from '../services/rdkit.service';
import { config } from 'react-spring';
import { GVertex } from '../services/drawers/rdkitDrawer';
import { Highlight2 } from '../components/molecule/structure/layers/Highlight';

export var SingleViewCounter = 0;

/**
 * Properties to define the visualization of a molecule.
 */
export type Props = {
  molecule: Molecule;
  gradientConfig: GradientConfigOverwriteDefaults;
  drawerType: DrawerType;
  width?: number;
  height?: number;
  bondLength?: number;
  hideBarChart?: boolean;
  hideAttributesTable?: boolean;
  showScoresOnStructure?: boolean;
};

export type Molecule = {
  string: string;
  sequence?: string[];
  method: Method;
  attributes: { [id: string]: number | string }; // attributes for each
  substructureHighlight;
};

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

function updateColorMaps(gradientConfig: GradientConfig, molecule: Molecule) {
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
export function SingleView(props: Props) {
  const index = SingleViewCounter;
  SingleViewCounter += 1;

  const { molecule } = props;
  const id = `${Date.now()}_${index}_${molecule.string}_${props.molecule.method?.name}`;
  const rawMolecule: RawMolecule = {
    ...molecule,
    id,
    index,
  } as RawMolecule;

  const { method } = props.molecule;
  const { bondLength = 50 } = props;
  const { width = 600 } = props;
  const { height = 300 } = props;
  const { hideBarChart = false } = props;
  const { hideAttributesTable = false } = props;
  const { showScoresOnStructure = false } = props;

  const svg = React.useMemo(() => {
    return window.RDKit.get_mol(molecule.string).get_svg(200, 200);
  }, [molecule.string]);

  const coordinates = React.useMemo(() => {
    return rdkitService.getAtomsCoordinatesFromSVG(svg);
  }, [svg]);

  const preprocessedMolecule = React.useMemo(() => {
    return moleculeStructureService.preprocessSmilesElementsAndMethod(rawMolecule);
  }, []);

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

  const structureColorMode = 'attribution';

  const heatmap = true;

  const theme = 'light';

  const gradientConfig: GradientConfig = gradientsService.getGradientConfig(props.gradientConfig); //! this gradient is further stored in ViewConfig

  const { drawerType = 'RDKitDrawer_black' } = props;

  const { gradient, colorDomain, colorsRange } = updateColorMaps(gradientConfig, molecule);

  const structureViewConfig = { gradient, width, height };

  const onMouseMoveOverStructure = (event: MouseEvent, mol: FullMolecule, scaleResolution: number) => {
    if (mol.vertices) {
      const x = event.offsetX; // x position within the element.
      const y = event.offsetY; // y position within the element.

      const verticesWithDistance = mol.vertices
        .map((vertex) => {
          const dx = vertex.position.x / scaleResolution - x;
          const dy = vertex.position.y / scaleResolution - y;
          return { vertex, distance: Math.sqrt(dx * dx + dy * dy) };
        })
        .filter((v) => v.distance < 40)
        .sort((a, b) => a.distance - b.distance);

      mol.vertices.forEach((v) => (v.hover = false));

      if (verticesWithDistance.length > 0) {
        verticesWithDistance[0].vertex.hover = true;
        setHoveredAtoms([verticesWithDistance[0].vertex.atomIndex]);
      } else {
        setHoveredAtoms([]);
      }
    }
  };
  console.log(hoveredAtoms);
  return (
    <div className="SingleView">
      <div>
        <div
          style={{
            position: 'relative',
            width: props.width,
            height: props.height,
          }}
          onMouseMove={(event) => onMouseMoveOverStructure(event.nativeEvent, preprocessedMolecule, window.devicePixelRatio)}
        >
          <img
            loading="lazy"
            alt={molecule.string}
            src={`data:image/svg+xml;base64,${btoa(svg)}`}
            style={{ position: 'absolute', left: 0, top: 0, width: props.width, height: props.height, objectFit: 'contain' }}
          />

          <Highlight2
            hoverVertices={moleculeStructureService.getHoveredVerticesFromMolecule(preprocessedMolecule)}
            config={structureViewConfig}
            scaleResolution={window.devicePixelRatio}
          />
        </div>
        <Smiles2
          key={`smiles${id}`}
          id={"test"}
          atomHover={hoveredAtoms}
          setAtomHover={setHoveredAtoms}
          smilesString={molecule.string}
          smilesScores={molecule.method.scores}
          updateStructure={() => {}}
          colorsDomain={colorDomain!} // if colorsDomain is undefined, showBarChart is false
          colorsRange={colorsRange}
          smilesElements={preprocessedMolecule.smilesElements!} // TODO now smilesElements contains scores, chars, etc... so this component's properties can be compacted
          alphaRange={[0.2, 1]}
          thresholds={gradientConfig.thresholds.length ? gradientConfig.thresholds : [0.5, 1.0]}
        />
      </div>

      <MoleculeViews
        id={id}
        molecule={preprocessedMolecule}
        rawMolecule={rawMolecule}
        method={method} // TODO remove method from this component, since it is already in molecule
        gradientConfig={gradientConfig}
        structureColorMode={structureColorMode}
        width={width}
        height={height}
        heatmap={heatmap}
        theme={theme}
        drawerType={drawerType}
        bondLength={bondLength}
        hideAttributesTable={hideAttributesTable}
        hideBarChart={hideBarChart}
        showScoresOnStructure={showScoresOnStructure}
      />
    </div>
  );
}

export default SingleView;
