import * as React from 'react';
import moleculeStructureService from '../../../services/molecule/molecule.structure.service';
import { DrawerConfig } from '../../../types/drawer.interface';
import { Molecule } from '../../../types/molecule.types';
import { StructureViewConfig } from '../../../types/structure.types';
import Heatmap from './layers/Heatmap';
import Structure from './layers/Structure';
import Highlight, { Highlight2 } from './layers/Highlight';

interface Props {
  id: string;
  onMouseMove: (event) => void;
  config?: StructureViewConfig;
  drawerConfig: DrawerConfig;
  molecule: Molecule;
  returnMoleculeWithVertices: (molecule: Molecule) => void;
  // hoverSmilesElements: SmilesElement[];
}

export default function StructureView(props: Props) {
  const { config, drawerConfig, molecule, returnMoleculeWithVertices, onMouseMove, id } = props;

  if (config === undefined) {
    throw new Error('Config cannot be null.');
    // TODO config = getDefaults();
  }

  return (
    <div onMouseMove={onMouseMove} style={{ position: 'relative', display: 'inline-flex', width: config.width, height: config.height }}>
      <Heatmap vertices={molecule.vertices} molecule={molecule} config={config} scaleResolution={drawerConfig.scaleResolution} />

      <Highlight2
        hoverVertices={moleculeStructureService.getHoveredVerticesFromMolecule(molecule)}
        config={config}
        scaleResolution={drawerConfig.scaleResolution}
      />

      <Structure id={`${id}_mol`} molecule={molecule} drawerConfig={drawerConfig} returnMoleculeWithVertices={returnMoleculeWithVertices} />
    </div>
  );
}
