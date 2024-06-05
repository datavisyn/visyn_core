import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

export enum EViolinOverlay {
  NONE = 'None',
  BOX = 'Box',
  STRIP = 'Strip',
}

export enum EViolinSeparationMode {
  GROUP = 'Group',
  FACETS = 'Facets',
}

export interface IViolinConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnSelected: ColumnInfo | null;
  subCategorySelected: ColumnInfo | null;
  facetBy: ColumnInfo | null;
  violinOverlay: EViolinOverlay;
  separation: EViolinSeparationMode;
}

export function isViolinConfig(s: BaseVisConfig): s is IViolinConfig {
  return s.type === ESupportedPlotlyVis.VIOLIN;
}
