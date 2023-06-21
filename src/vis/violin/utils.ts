import merge from 'lodash/merge';
import {
  PlotlyInfo,
  PlotlyData,
  VisCategoricalColumn,
  EColumnTypes,
  ESupportedPlotlyVis,
  IVisConfig,
  VisNumericalColumn,
  Scales,
  VisColumn,
  IViolinConfig,
  EViolinOverlay,
} from '../interfaces';
import { columnNameWithDescription, resolveColumnValues } from '../general/layoutUtils';
import { i18n } from '../../i18n';
import { SELECT_COLOR } from '../general/constants';

const defaultConfig: IViolinConfig = {
  type: ESupportedPlotlyVis.VIOLIN,
  numColumnsSelected: [],
  catColumnsSelected: [],
  violinOverlay: EViolinOverlay.NONE,
};

export function violinMergeDefaultConfig(columns: VisColumn[], config: IViolinConfig): IViolinConfig {
  const merged = merge({}, defaultConfig, config);

  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (merged.numColumnsSelected.length === 0 && numCols.length > 0) {
    merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
  }

  return merged;
}

export async function createViolinTraces(
  columns: VisColumn[],
  config: IViolinConfig,
  scales: Scales,
  selectedList: string[],
  selectedMap: { [key: string]: boolean },
): Promise<PlotlyInfo> {
  let plotCounter = 1;

  if (!config.numColumnsSelected || !config.catColumnsSelected) {
    return {
      plots: [],
      legendPlots: [],
      rows: 0,
      cols: 0,
      errorMessage: i18n.t('visyn:vis.violinError'),
      errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
    };
  }

  const numCols: VisNumericalColumn[] = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const catCols: VisCategoricalColumn[] = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisCategoricalColumn);
  const plots: PlotlyData[] = [];

  const numColValues = await resolveColumnValues(numCols);
  const catColValues = await resolveColumnValues(catCols);

  // if we onl have numerical columns, add them individually.
  if (catColValues.length === 0) {
    for (const numCurr of numColValues) {
      plots.push({
        data: {
          y: numCurr.resolvedValues.map((v) => v.val),
          ids: numCurr.resolvedValues.map((v) => v.id),
          xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
          yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
          type: 'violin',
          pointpos: 0,
          jitter: 0.3,
          // @ts-ignore
          hoveron: 'violins',
          points: false,
          box: {
            visible: config.violinOverlay === EViolinOverlay.BOX,
          },
          marker: {
            color: selectedList.length !== 0 && numCurr.resolvedValues.find((val) => selectedMap[val.id]) ? SELECT_COLOR : '#878E95',
          },

          spanmode: 'hard',
          name: `${columnNameWithDescription(numCurr.info)}`,
          hoverinfo: 'y',
          scalemode: 'width',
          showlegend: false,
        },
        xLabel: columnNameWithDescription(numCurr.info),
        yLabel: columnNameWithDescription(numCurr.info),
      });
      plotCounter += 1;
    }
  }

  for (const numCurr of numColValues) {
    for (const catCurr of catColValues) {
      plots.push({
        data: {
          x: catCurr.resolvedValues.map((v) => v.val),
          ids: catCurr.resolvedValues.map((v) => v.id),
          y: numCurr.resolvedValues.map((v) => v.val),
          xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
          yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
          type: 'violin',
          // @ts-ignore
          hoveron: 'violins',
          hoverinfo: 'y',
          name: `${columnNameWithDescription(catCurr.info)} + ${columnNameWithDescription(numCurr.info)}`,
          scalemode: 'width',
          pointpos: 0,
          jitter: 0.3,
          spanmode: 'hard',
          points: false,
          box: {
            visible: config.violinOverlay === EViolinOverlay.BOX,
          },
          showlegend: false,
          transforms: [
            {
              type: 'groupby',
              groups: catCurr.resolvedValues.map((v) => v.val) as string[],
              styles: [...new Set<string>(catCurr.resolvedValues.map((v) => v.val) as string[])].map((c) => {
                return {
                  target: c,
                  value: {
                    line: {
                      color:
                        selectedList.length !== 0 && catCurr.resolvedValues.filter((val) => val.val === c).find((val) => selectedMap[val.id])
                          ? SELECT_COLOR
                          : '#878E95',
                    },
                  },
                };
              }),
            },
          ],
        },
        xLabel: columnNameWithDescription(catCurr.info),
        yLabel: columnNameWithDescription(numCurr.info),
      });
      plotCounter += 1;
    }
  }

  return {
    plots,
    legendPlots: [],
    rows: numColValues.length,
    cols: catColValues.length > 0 ? catColValues.length : 1,
    errorMessage: i18n.t('visyn:vis.violinError'),
    errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
  };
}
