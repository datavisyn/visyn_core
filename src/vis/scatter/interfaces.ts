import { BaseVisConfig, ColumnInfo, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis } from '../interfaces';

export interface IScatterConfig extends BaseVisConfig {
  type: ESupportedPlotlyVis.SCATTER;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  dragMode: EScatterSelectSettings;
  alphaSliderVal: number;
  sizeSliderVal: number;
}

export function isScatterConfig(s: BaseVisConfig): s is IScatterConfig {
  return s.type === ESupportedPlotlyVis.SCATTER;
}