import { BaseVisConfig, ColumnInfo, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, IPlotStats } from '../interfaces';

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
  facets: ColumnInfo | null;
  regressionLineOptions?: IRegressionLineOptions;
  showLegend?: boolean;
}

export function isScatterConfig(s: BaseVisConfig): s is IScatterConfig {
  return s.type === ESupportedPlotlyVis.SCATTER;
}

export enum ELabelingOptions {
  NEVER = 'Never',
  ALWAYS = 'Always',
  SELECTED = 'Selected',
}

// Disabled all methods using Math.log for now, as this causes NaN values in the prediction for negative xy values
export enum ERegressionLineType {
  NONE = 'None',
  LINEAR = 'Linear',
  POLYNOMIAL = 'Polynomial',
}

export interface IRegressionResult {
  stats: IPlotStats;
  equation: string;
  svgPath: string;
  xref: string;
  yref: string;
}

export interface IRegressionFitOptions {
  order: number;
  precision: number;
}

export interface IRegressionLineOptions {
  type: ERegressionLineType;
  fitOptions?: IRegressionFitOptions;
  showStats?: boolean;
  lineStyle?: Partial<{ colors: string[]; colorSelected: number; width: number; dash: Plotly.Dash }>; // Colors must be passed as array of hex strings
}
