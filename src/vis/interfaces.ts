import type { PlotlyTypes } from '../plotly';

export enum ESupportedPlotlyVis {
  SCATTER = 'Scatter plot',
  VIOLIN = 'Violin plot',
  BAR = 'Bar chart',
  HEXBIN = 'Hexbin plot',
  HEATMAP = 'Heatmap plot',
  PARALLEL_COORDINATES = 'Parallel plot',
  RAINCLOUD = 'Raincloud plot',
  SANKEY = 'Sankey',
  CORRELATION = 'Correlation plot',
}

export interface BaseVisConfig {
  type: string;
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

export enum EGeneralFormType {
  DROPDOWN = 'Dropdown',
  BUTTON = 'Button',
  SLIDER = 'Slider',
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

export enum ECloudType {
  SPLIT_VIOLIN = 'Split violin',
  HEATMAP = 'Heatmap',
  HISTOGRAM = 'Histogram',
}

export enum ELightningType {
  MEAN_AND_DEV = 'Mean and deviation',
  MEDIAN_AND_DEV = 'Median and deviation',
  MEAN = 'Mean',
  BOXPLOT = 'Boxplot',
}

export enum ERainType {
  DOTPLOT = 'Dot plot',
  BEESWARM = 'Beeswarm',
  WHEATPLOT = 'Wheat plot',
  STRIPPLOT = 'Strip plot',
}

export enum ESortTypes {
  NONE = 'NONE',
  CAT_ASC = 'CAT_ASC',
  CAT_DESC = 'CAT_DESC',
  COUNT_ASC = 'COUNT_ASC',
  COUNT_DESC = 'COUNT_DESC',
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
  val: Type;
}

export type VisNumericalValue = IVisCommonValue<number>;

export type VisCategoricalValue = IVisCommonValue<string>;

export interface VisCommonColumn {
  info: ColumnInfo;
  values: ValueGetter<(VisNumericalValue | VisCategoricalValue)[]>;
}

export interface VisNumericalColumn extends VisCommonColumn {
  type: EColumnTypes.NUMERICAL;
  domain?: [number | undefined, number | undefined];
  color?: Record<string, string>;
}

export interface VisCategoricalColumn extends VisCommonColumn {
  type: EColumnTypes.CATEGORICAL;
  color?: Record<string, string>;
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

/**
 * Common props for all vis sidebars.
 */
export interface ICommonVisSideBarProps<T> {
  style?: React.CSSProperties | undefined;
  className?: string | undefined;
  columns: VisColumn[];
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
  filterCallback?: (s: EFilterOptions) => void;
  selectionCallback?: (s: string[]) => void;
  selectedMap?: { [key: string]: boolean };
  selectedList?: string[];
  showCloseButton?: boolean;
  closeButtonCallback?: () => void;
  scales?: Scales;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  showSidebarDefault?: boolean;
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
