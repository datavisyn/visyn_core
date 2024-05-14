import merge from 'lodash/merge';
import { i18n } from '../../i18n';
import { SELECT_COLOR } from '../general/constants';
import { columnNameWithDescription, resolveColumnValues } from '../general/layoutUtils';
import { EColumnTypes, ESupportedPlotlyVis, PlotlyData, PlotlyInfo, Scales, VisCategoricalColumn, VisColumn, VisNumericalColumn } from '../interfaces';
import { EViolinMultiplesMode, EViolinOverlay, IViolinConfig } from './interfaces';

const defaultConfig: IViolinConfig = {
  type: ESupportedPlotlyVis.VIOLIN,
  numColumnsSelected: [],
  catColumnsSelected: [],
  violinOverlay: EViolinOverlay.NONE,
  multiplesMode: EViolinMultiplesMode.GROUP,
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

  const sharedData = {
    type: 'violin' as Plotly.PlotType,
    pointpos: 0,
    jitter: 0.3,
    points: false,
    box: {
      visible: config.violinOverlay === EViolinOverlay.BOX,
    },
    spanmode: 'hard',
    hoverinfo: 'y',
    scalemode: 'width',
    showlegend: false,
  };

  // case: only numerical columns selected
  if (catColValues.length === 0) {
    for (const numCurr of numColValues) {
      const y = numCurr.resolvedValues.map((v) => v.val);
      plots.push({
        data: {
          y,
          ids: numCurr.resolvedValues.map((v) => v.id),
          xaxis: config.multiplesMode === EViolinMultiplesMode.GROUP || plotCounter === 1 ? 'x' : `x${plotCounter}`,
          yaxis: config.multiplesMode === EViolinMultiplesMode.GROUP || plotCounter === 1 ? 'y' : `y${plotCounter}`,
          marker: {
            color: selectedList.length !== 0 && numCurr.resolvedValues.find((val) => selectedMap[val.id]) ? SELECT_COLOR : '#878E95',
          },
          name: `${columnNameWithDescription(numCurr.info)}`,
          // @ts-ignore
          hoveron: 'violins',
          ...sharedData,
        },
      });
      plotCounter += 1;
    }
  }

  // Case: Exactly one numerical and multiple categorical columns selected
  if (numColValues.length === 1 && catColValues.length > 0) {
    for (const numCurr of numColValues) {
      for (const catCurr of catColValues) {
        const y = numCurr.resolvedValues.map((v) => v.val);
        // Null values in categorical columns would break the plot --> replace with 'missing'
        const categoriesWithMissing = catCurr.resolvedValues?.map((v) => ({ ...v, val: v.val || 'missing' }));
        const x = categoriesWithMissing.map((v) => v.val);
        plots.push({
          data: {
            x,
            y,
            ids: categoriesWithMissing.map((v) => v.id),
            xaxis: config.multiplesMode === EViolinMultiplesMode.GROUP || plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: config.multiplesMode === EViolinMultiplesMode.GROUP || plotCounter === 1 ? 'y' : `y${plotCounter}`,
            // @ts-ignore
            hoveron: 'violins',
            name: `${columnNameWithDescription(catCurr.info)} + ${columnNameWithDescription(numCurr.info)}`,
            transforms: [
              {
                type: 'groupby',
                groups: x as string[],
                styles: [...new Set(x as string[])].map((c) => {
                  return {
                    target: c,
                    value: {
                      line: {
                        color:
                          selectedList.length !== 0 && categoriesWithMissing.filter((val) => val.val === c).find((val) => selectedMap[val.id])
                            ? SELECT_COLOR
                            : '#878E95',
                      },
                    },
                  };
                }),
              },
            ],
            ...sharedData,
          },
          xLabel: columnNameWithDescription(catCurr.info),
          yLabel: columnNameWithDescription(numCurr.info),
        });
        plotCounter += 1;
      }
    }
  }

  // Case: Multiple numerical columns and multiple categorical columns selected
  if (numColValues.length > 1 && catColValues.length > 0) {
    for (const numCurr of numColValues) {
      for (const catCurr of catColValues) {
        const y = numCurr.resolvedValues.map((v) => v.val);
        // Null values in categorical columns would break the plot --> replace with 'missing'
        const categoriesWithMissing = catCurr.resolvedValues?.map((v) => ({ ...v, val: v.val || 'missing' }));
        const x = categoriesWithMissing.map((v) => v.val + ' ' + columnNameWithDescription(numCurr.info));
        plots.push({
          data: {
            x,
            y,
            // @ts-ignore
            hoveron: 'violins',
            ...sharedData,
          },
        });
        plotCounter += 1;
      }
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
