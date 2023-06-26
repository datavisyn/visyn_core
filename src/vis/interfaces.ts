import type { PlotlyTypes } from '../plotly';

export enum ESupportedPlotlyVis {
  SCATTER = 'Scatter plot',
  VIOLIN = 'Violin plot',
  BAR = 'Bar chart',
  HEXBIN = 'Hexbin plot',
  HEATMAP = 'Heatmap plot',
}

export const allVisTypes: ESupportedPlotlyVis[] = [
  ESupportedPlotlyVis.SCATTER,
  ESupportedPlotlyVis.BAR,
  ESupportedPlotlyVis.VIOLIN,
  ESupportedPlotlyVis.HEXBIN,
  ESupportedPlotlyVis.HEATMAP,
];

export type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IHexbinConfig | IHeatmapConfig;

export interface BaseConfig {
  type: string;
}

export enum EBarDisplayType {
  ABSOLUTE = 'Absolute',
  NORMALIZED = 'Normalized',
}

export enum EHexbinOptions {
  COLOR = 'Color',
  PIE = 'Pie',
  BINS = 'Bins',
}

export enum EBarDirection {
  VERTICAL = 'Vertical',
  HORIZONTAL = 'Horizontal',
}

export enum EViolinOverlay {
  NONE = 'None',
  BOX = 'Box',
}

export enum EAggregateTypes {
  COUNT = 'Count',
  MIN = 'Minimum',
  AVG = 'Average',
  MED = 'Median',
  MAX = 'Maximum',
}

export enum EBarGroupingType {
  STACK = 'Stacked',
  GROUP = 'Grouped',
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

export interface IViolinConfig extends BaseConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
  violinOverlay: EViolinOverlay;
}

export interface IScatterConfig extends BaseConfig {
  type: ESupportedPlotlyVis.SCATTER;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  dragMode: EScatterSelectSettings;
  alphaSliderVal: number;
}

export interface IBarConfig extends BaseConfig {
  type: ESupportedPlotlyVis.BAR;
  multiples: ColumnInfo | null;
  group: ColumnInfo | null;
  direction: EBarDirection;
  display: EBarDisplayType;
  groupType: EBarGroupingType;
  numColumnsSelected: ColumnInfo[];
  catColumnSelected: ColumnInfo;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
}

export interface ISankeyConfig extends BaseConfig {
  type: ESupportedPlotlyVis.SANKEY;
  catColumnsSelected: ColumnInfo[];
}

export interface IHexbinConfig extends BaseConfig {
  type: ESupportedPlotlyVis.HEXBIN;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  hexRadius: number;
  isOpacityScale: boolean;
  isSizeScale: boolean;
  dragMode: EScatterSelectSettings;
  hexbinOptions: EHexbinOptions;
}

export interface IHeatmapConfig {
  type: ESupportedPlotlyVis.HEATMAP;
  color: ColumnInfo | null;
  catColumnsSelected: ColumnInfo[];
  numColorScaleType: ENumericalColorScaleType;
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
  externalConfig?: T;
  setExternalConfig?: (config: T) => void;
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
