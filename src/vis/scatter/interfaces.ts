import { BaseVisConfig, ColumnInfo, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, IPlotStats } from '../interfaces';

export interface IScatterConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.SCATTER;
  // Numerical columns selected for x and y axis. If 2 are selected, a normal scatter plot is shown. If more than 2 are selected, a SPLOM is shown.
  numColumnsSelected: ColumnInfo[];
  // This attribute splits the data into multiple scatter plots based on the selected column.
  facets: ColumnInfo | null;
  // This attribute can be used to directly control which subplots should be shown.
  subplots: { xColumn: ColumnInfo; yColumn: ColumnInfo; title: string }[] | undefined;
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  dragMode: EScatterSelectSettings;
  alphaSliderVal: number;
  showLabels: ELabelingOptions;
  showLabelLimit?: number;
  regressionLineOptions?: IRegressionLineOptions;
  showLegend?: boolean;
  labelColumns?: ColumnInfo[];
}

/**
 * @internal
 */
export interface IInternalScatterConfig extends IScatterConfig {
  /**
   * Internal property used to show a message if show labels mode is `Selected`
   */
  selectedPointsCount?: number;
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
