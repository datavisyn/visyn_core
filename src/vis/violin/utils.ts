import _ from 'lodash';
import merge from 'lodash/merge';
import { i18n } from '../../i18n';
import { SELECT_COLOR } from '../general/constants';
import { columnNameWithDescription, resolveColumnValues } from '../general/layoutUtils';
import { EColumnTypes, ESupportedPlotlyVis, PlotlyData, PlotlyInfo, Scales, VisCategoricalColumn, VisColumn, VisNumericalColumn } from '../interfaces';
import { EViolinSeparationMode, EViolinOverlay, IViolinConfig } from './interfaces';
import { categoricalColors } from '../../utils';

const defaultConfig: IViolinConfig = {
  type: ESupportedPlotlyVis.VIOLIN,
  numColumnsSelected: [],
  catColumnsSelected: [],
  violinOverlay: EViolinOverlay.NONE,
  multiplesMode: EViolinSeparationMode.GROUP,
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
  const legendPlots: PlotlyData[] = [];

  const numColValues = await resolveColumnValues(numCols);
  // Null values in categorical columns would break the plot --> replace with 'missing'
  const catColValues = (await resolveColumnValues(catCols)).map((col) => ({
    ...col,
    resolvedValues: col.resolvedValues.map((v) => ({ ...v, val: v.val || 'missing' })),
  }));

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
  if (numColValues.length > 0 && catColValues.length === 0) {
    for (const numCurr of numColValues) {
      const y = numCurr.resolvedValues.map((v) => v.val);
      plots.push({
        data: {
          y,
          ids: numCurr.resolvedValues.map((v) => v.id),
          xaxis: config.multiplesMode === EViolinSeparationMode.GROUP || plotCounter === 1 ? 'x' : `x${plotCounter}`,
          yaxis: config.multiplesMode === EViolinSeparationMode.GROUP || plotCounter === 1 ? 'y' : `y${plotCounter}`,
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
        const x = catCurr.resolvedValues.map((v) => v.val);
        plots.push({
          data: {
            x,
            y,
            ids: catCurr.resolvedValues.map((v) => v.id),
            xaxis: config.multiplesMode === EViolinSeparationMode.GROUP || plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: config.multiplesMode === EViolinSeparationMode.GROUP || plotCounter === 1 ? 'y' : `y${plotCounter}`,
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
                          selectedList.length !== 0 && catCurr.resolvedValues.filter((val) => val.val === c).find((val) => selectedMap[val.id])
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
          xLabel: catColValues.length > 1 ? null : columnNameWithDescription(catCurr.info),
          yLabel: columnNameWithDescription(numCurr.info),
        });
        plotCounter += 1;
      }
    }
  }

  // Case: Multiple numerical columns and multiple categorical columns selected
  if (numColValues.length > 1 && catColValues.length > 0) {
    const allCategories = [...new Set(catColValues.map((cat) => cat.resolvedValues.map((v) => v.val)).flat())];
    const colorMap = allCategories.reduce((acc, curr, i) => {
      acc[curr] = categoricalColors[i % categoricalColors.length];
      return acc;
    }, {});

    if (config.multiplesMode === EViolinSeparationMode.GROUP) {
      const data = [];
      for (const numCurr of numColValues) {
        for (const catCurr of catColValues) {
          numCurr.resolvedValues.forEach((v, i) =>
            data.push({ y: v.val, x: columnNameWithDescription(numCurr.info), group: catCurr.resolvedValues[i].val, ids: v.id?.toString() }),
          );
        }
      }
      const groupedData = _.groupBy(data, 'group');

      _.flatMap(groupedData, (group, key) => {
        plots.push({
          data: {
            y: group.map((g) => g.y),
            x: group.map((g) => g.x),
            ids: group.map((g) => g.ids),
            marker: {
              color:
                selectedList.length !== 0 && group.find((val) => selectedMap[val.ids]) ? SELECT_COLOR : selectedList.length > 0 ? '#878E95' : colorMap[key],
            },
            // @ts-ignore
            hoveron: 'violins',
            legendgroup: key,
            scalegroup: key,
            name: key,
            ...sharedData,
          },
        });
        plotCounter += 1;
      });
    } else if (config.multiplesMode === EViolinSeparationMode.FACETS) {
      for (const numCurr of numColValues) {
        const data: { y: number; x: string; ids: string }[] = [];
        for (const catCurr of catColValues) {
          catCurr.resolvedValues.forEach((v, i) =>
            data.push({ y: numCurr.resolvedValues[i].val as number, x: v.val as string, ids: numCurr.resolvedValues[i].id?.toString() }),
          );
        }
        plots.push({
          data: {
            x: data.map((d) => d.x),
            y: data.map((d) => d.y),
            ids: data.map((d) => d.ids),
            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
            transforms: [
              {
                type: 'groupby',
                groups: data.map((d) => d.x),
                styles: allCategories.map((c) => {
                  return {
                    target: c,
                    value: {
                      line: {
                        color:
                          selectedList.length !== 0 && data.filter((val) => val.x === c).find((val) => selectedMap[val.ids])
                            ? SELECT_COLOR
                            : selectedList.length > 0
                              ? '#878E95'
                              : colorMap[c],
                      },
                    },
                  };
                }),
              },
            ],
            name: `${columnNameWithDescription(numCurr.info)}`,
            // @ts-ignore
            hoveron: 'violins',
            ...sharedData,
          },
          yLabel: columnNameWithDescription(numCurr.info),
        });
        plotCounter += 1;
      }
    }

    // Add legend as separate traces
    allCategories.forEach((c) => {
      legendPlots.push({
        data: {
          x: [null] as Plotly.Datum[],
          y: [null] as Plotly.Datum[],
          marker: {
            color: colorMap[c],
          },
          // @ts-ignore
          hoveron: 'violins',
          name: c as string,
          showlegend: true,
          type: 'violin',
          legendgroup: 'shape',
          hoverinfo: 'skip',
        },
      });
    });
  }

  const defaultColNum = Math.min(Math.ceil(Math.sqrt(plots.length)), 5);

  return {
    plots,
    legendPlots,
    rows: Math.ceil(plots.length / defaultColNum),
    cols: defaultColNum,
    errorMessage: i18n.t('visyn:vis.violinError'),
    errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
  };
}
