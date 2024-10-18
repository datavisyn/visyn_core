import React from 'react';
import { Method, RawMolecule } from '../types/molecule.types';
import { GradientConfig, GradientConfigOverwriteDefaults } from '../types/gradient.types';
import MoleculeViews from '../components/molecule/MoleculeViews';
import './SingleView.css';
import gradientsService from '../services/gradients.service';
import { DrawerType } from '../types/drawer.interface';
import Smiles, { Smiles2 } from '../components/molecule/smiles/Smiles';
import colorsService from '../services/colors.service';
import moleculeStructureService from '../services/molecule/molecule.structure.service';
import rdkitService from '../services/rdkit.service';

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

export function SVGRenderer() {
  const [svg, setSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const genSvg = window.RDKit.get_mol('OCCc1c(C)[n+](cs1)Cc2cnc(C)nc2N').get_svg(250, 200);
    setSvg(genSvg);
    console.log(genSvg);
    console.log(rdkitService.getAtomsCoordinatesFromSVG(genSvg));
  }, []);

  return <div>test</div>;
}

export function SingleView2(props: Props) {
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

  const structureColorMode = 'attribution';

  const heatmap = true;

  const theme = 'light';

  const gradientConfig: GradientConfig = gradientsService.getGradientConfig(props.gradientConfig); //! this gradient is further stored in ViewConfig

  const { drawerType = 'RDKitDrawer_black' } = props;

  const { gradient, colorDomain, colorsRange } = updateColorMaps(gradientConfig, molecule);

  console.log(rawMolecule);
  const preprocessedMolecule = moleculeStructureService.preprocessSmilesElementsAndMethod(rawMolecule);

  console.log(preprocessedMolecule);

  return (
    <div>
      <Smiles2
        key={`smiles${id}`}
        id={id}
        smilesString={preprocessedMolecule.string}
        smilesScores={preprocessedMolecule.method.scores}
        updateStructure={() => {}}
        colorsDomain={colorDomain!} // if colorsDomain is undefined, showBarChart is false
        colorsRange={colorsRange}
        smilesElements={preprocessedMolecule.smilesElements!} // TODO now smilesElements contains scores, chars, etc... so this component's properties can be compacted
        alphaRange={[1.0, 1.0]}
        thresholds={gradientConfig.thresholds.length ? gradientConfig.thresholds : [0.5, 1.0]}
      />
      <SVGRenderer />
    </div>
  );
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

  const structureColorMode = 'attribution';

  const heatmap = true;

  const theme = 'light';

  const gradientConfig: GradientConfig = gradientsService.getGradientConfig(props.gradientConfig); //! this gradient is further stored in ViewConfig

  const { drawerType = 'RDKitDrawer_black' } = props;

  return (
    <div className="SingleView">
      <MoleculeViews
        id={id}
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
