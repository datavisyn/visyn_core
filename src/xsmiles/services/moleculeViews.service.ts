import { MoleculeViewsConfig } from '../types/moleculeViews.types';

class MoleculeViewsService {
  public covertTo3ColorRangeForSmilesBars = (colors: string[]) => {
    return [colors[0], '#999999', colors[colors.length - 1]];
  };

  public updateColorRange = (config: MoleculeViewsConfig) => {
    return { ...config };
  };
}

export default new MoleculeViewsService();
