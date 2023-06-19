import { merge } from 'lodash';
import {
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  IParallelCoordinatesConfig,
  IScatterConfig,
  IVisConfig,
  VisColumn,
} from '../interfaces';

export function isParallelCoordinates(s: IVisConfig): s is IParallelCoordinatesConfig {
  return s.type === ESupportedPlotlyVis.PARALLEL_COORDINATES;
}

const defaultConfig: IParallelCoordinatesConfig = {
  type: ESupportedPlotlyVis.PARALLEL_COORDINATES,
  numColumnsSelected: [],
  catColumnsSelected: [],
  color: null,
};

export function parallelCoordinatesMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  return merged;
}
