import { BaseVisConfig, ColumnInfo, ESupportedPlotlyVis } from '../interfaces';

export enum EViolinOverlay {
  NONE = 'None',
  BOX = 'Box',
  STRIP = 'Strip',
}

export enum EYAxisMode {
  UNSYNC = 'unsynced',
  SYNC = 'synced',
}

export interface IViolinConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnSelected: ColumnInfo | null;
  subCategorySelected: ColumnInfo | null;
  facetBy: ColumnInfo | null;
  overlay: EViolinOverlay;
  syncYAxis?: EYAxisMode;
}

export function isViolinConfig(s: BaseVisConfig): s is IViolinConfig {
  return s.type === ESupportedPlotlyVis.VIOLIN;
}
