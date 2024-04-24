import { BaseVisConfig, ColumnInfo, ENumericalColorScaleType, ERegressionLineOptions, EScatterSelectSettings, ESupportedPlotlyVis } from '../interfaces';

export interface IScatterConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.SCATTER;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  dragMode: EScatterSelectSettings;
  alphaSliderVal: number;
  sizeSliderVal: number;
  showLabels: ELabelingOptions;
  showRegressionLine: ERegressionLineOptions;
  regressionLineStyle?: Partial<Plotly.ShapeLine>;
}

export function isScatterConfig(s: BaseVisConfig): s is IScatterConfig {
  return s.type === ESupportedPlotlyVis.SCATTER;
}

export enum ELabelingOptions {
  NEVER = 'Never',
  ALWAYS = 'Always',
  SELECTED = 'Selected',
}
