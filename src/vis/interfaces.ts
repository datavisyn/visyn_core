import type { PlotlyTypes } from '../plotly';

export enum ESupportedPlotlyVis {
  SCATTER = 'Scatter plot',
  VIOLIN = 'Violin plot',
  BOXPLOT = 'Box plot',
  BAR = 'Bar chart',
  HEXBIN = 'Hexbin plot',
  HEATMAP = 'Heatmap plot',
  SANKEY = 'Sankey',
  CORRELATION = 'Correlation plot',
}

export function isESupportedPlotlyVis(value: string): value is ESupportedPlotlyVis {
  return Object.values(ESupportedPlotlyVis).includes(value as ESupportedPlotlyVis);
}

export interface BaseVisConfig {
  type: string;
  /**
   * Merge the config with the default values once or if the vis type changes.
   * @default false
   */
  merged?: boolean;
}

export enum EAggregateTypes {
  COUNT = 'Count',
  MIN = 'Minimum',
  AVG = 'Average',
  MED = 'Median',
  MAX = 'Maximum',
}

export enum EColumnTypes {
  NUMERICAL = 'Numerical',
  CATEGORICAL = 'Categorical',
}

export enum EFilterOptions {
  IN = 'Filter in',
  OUT = 'Filter out',
  CLEAR = 'Clear',
}

export enum ENumericalColorScaleType {
  SEQUENTIAL = 'Sequential',
  DIVERGENT = 'Divergent',
}

export enum EScatterSelectSettings {
  RECTANGLE = 'select',
  LASSO = 'lasso',
  ZOOM = 'zoom',
  PAN = 'pan',
}

export enum EScaleType {
  LINEAR = 'Linear',
  LOG = 'Log',
}

type ValueGetter<T> = () => T | Promise<T>;

export interface IVisCommonValue<Type extends number | string> {
  /**
   * Visyn id of the row.
   */
  id: string;
  /**
   * Value of a vis column.
   */
  val: Type | null | undefined;
}

export type VisNumericalValue = IVisCommonValue<number>;

export type VisCategoricalValue = IVisCommonValue<string>;

export interface VisCommonColumn {
  info: ColumnInfo;
  values: ValueGetter<(VisNumericalValue | VisCategoricalValue)[]>;
  isLabel?: boolean;
}

export interface VisNumericalColumn extends VisCommonColumn {
  type: EColumnTypes.NUMERICAL;
  domain?: [number | undefined, number | undefined];
  color?: Record<string, string>;
}

export interface VisCategoricalColumn extends VisCommonColumn {
  type: EColumnTypes.CATEGORICAL;
  color?: Record<string, string>;
  domain?: string[];
}

export type VisColumn = VisNumericalColumn | VisCategoricalColumn;

export type PlotlyInfo = {
  plots: PlotlyData[];
  legendPlots: PlotlyData[];
  rows: number;
  cols: number;
  errorMessage: string;
  errorMessageHeader: string;
};

export type PlotlyData = {
  data: Partial<PlotlyTypes.PlotData>;
  xLabel: string;
  yLabel: string;
  xTicks?: string[];
  xTickLabels?: string[];
  yTicks?: string[];
  yTickLabels?: string[];
  xDomain?: [number | undefined, number | undefined];
  yDomain?: [number | undefined, number | undefined];
  title?: string;
};

export type ColumnInfo = {
  name: string;
  id: string;
  description: string;
};

export type Scales = {
  color: any;
};

export interface IPlotStats {
  n?: number;
  r2?: number;
  pValue?: number;
  pearsonRho?: number;
  spearmanRho?: number;
}

/**
 * Common props for all vis sidebars.
 */
export interface ICommonVisSideBarProps<T> {
  style?: React.CSSProperties | undefined;
  className?: string | undefined;
  columns: VisColumn[];
  selectedList?: string[];
  optionsConfig?: any;
  filterCallback?: (s: EFilterOptions) => void;
  config: T;
  setConfig: (c: T) => void;
}

export interface ICommonVisProps<T> {
  config?: T;
  setConfig?: (config: T) => void;
  columns: VisColumn[];
  optionsConfig?: any;
  colors?: string[];
  shapes?: string[];
  stats?: IPlotStats;
  statsCallback?: (s: IPlotStats) => void;
  filterCallback?: (s: EFilterOptions) => void;
  selectionCallback?: (s: string[]) => void;
  selectedMap?: { [key: string]: boolean };
  selectedList?: string[];
  showCloseButton?: boolean;
  closeButtonCallback?: () => void;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  showSidebarDefault?: boolean;
  uniquePlotId?: string;
  showDownloadScreenshot?: boolean;
  setShowSidebar?: (s: boolean) => void;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  scrollZoom?: boolean;
  showDragModeOptions?: boolean;
  dimensions: { width: number; height: number };
}
