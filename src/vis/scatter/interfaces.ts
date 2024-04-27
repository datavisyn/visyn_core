import { BaseVisConfig, ColumnInfo, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis } from '../interfaces';

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

export enum ERegressionLineType {
  NONE = 'None',
  LINEAR = 'Linear',
  POLYNOMIAL = 'Polynomial',
  EXPONENTIAL = 'Exponential',
  LOGARITHMIC = 'Logarithmic',
  POWER = 'Power',
}

export interface IRegressionResult {
  stats: {
    r2: number;
    correlation: number;
    n: number;
  };
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
  fitOptions: IRegressionFitOptions;
  showStats?: boolean;
  lineStyle?: Partial<Plotly.ShapeLine>;
  setRegressionResults?: (results: IRegressionResult[]) => void;
}
