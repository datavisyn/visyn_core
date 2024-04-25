import { BaseVisConfig, ColumnInfo, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis } from '../interfaces';
import { IRegressionLineOptions } from './Regression';

export interface IScatterConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.SCATTER;
  numColumnsSelected: ColumnInfo[];
  facets: ColumnInfo | null;
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  dragMode: EScatterSelectSettings;
  alphaSliderVal: number;
  sizeSliderVal: number;
  showLabels: ELabelingOptions;
  regressionLineOptions: IRegressionLineOptions;
}

export function isScatterConfig(s: BaseVisConfig): s is IScatterConfig {
  return s.type === ESupportedPlotlyVis.SCATTER;
}

export enum ELabelingOptions {
  NEVER = 'Never',
  ALWAYS = 'Always',
  SELECTED = 'Selected',
}
