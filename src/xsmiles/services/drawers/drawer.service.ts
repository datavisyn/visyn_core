import { DrawerConfig } from '../../types/drawer.interface';
import { Molecule } from '../../types/molecule.types';
import RDKitDrawer from './rdkitDrawer';

class DrawerService {
  public createDrawer(canvas: HTMLCanvasElement, molecule: Molecule, drawerConfig: DrawerConfig) {
    if (drawerConfig.drawerType.indexOf('RDKitDrawer') !== -1) {
      return new RDKitDrawer(canvas, molecule, drawerConfig);
    }
  }
}

export default new DrawerService();
