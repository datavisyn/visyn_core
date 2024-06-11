import _ from 'lodash';
import merge from 'lodash/merge';
import { i18n } from '../../i18n';
import { categoricalColors } from '../../utils';
import { NAN_REPLACEMENT, SELECT_COLOR } from '../general/constants';
import { columnNameWithDescription, resolveColumnValues } from '../general/layoutUtils';
import { EColumnTypes, ESupportedPlotlyVis, PlotlyData, PlotlyInfo, Scales, VisCategoricalColumn, VisColumn, VisNumericalColumn } from '../interfaces';
import { EViolinOverlay, EViolinSeparationMode, IViolinConfig } from './interfaces';

const defaultConfig: IViolinConfig = {
  type: ESupportedPlotlyVis.VIOLIN,
  numColumnsSelected: [],
  catColumnsSelected: [],
  violinOverlay: EViolinOverlay.NONE,
  separation: EViolinSeparationMode.FACETS,
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
): Promise<PlotlyInfo & { hasFacets?: boolean; selectedXMap?: { [key: string]: boolean } }> {
  let plotCounter = 1;
  let hasFacets = false;
  let selectedXMap = null;

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
  // Null values in categorical columns would break the plot --> replace with NAN_REPLACEMENT
  const catColValues = (await resolveColumnValues(catCols)).map((col) => ({
    ...col,
    resolvedValues: col.resolvedValues.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })),
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

  // case: Only numerical columns selected
  if (numColValues.length > 0 && catColValues.length === 0) {
    hasFacets = true; // Must always be set to true in this case
    for (const numCurr of numColValues) {
      const y = numCurr.resolvedValues.map((v) => v.val);
      const yLabel = columnNameWithDescription(numCurr.info);
      plots.push({
        data: {
          y,
          ids: numCurr.resolvedValues.map((v) => v.id),
          xaxis: config.separation === EViolinSeparationMode.GROUP || plotCounter === 1 ? 'x' : `x${plotCounter}`,
          yaxis: config.separation === EViolinSeparationMode.GROUP || plotCounter === 1 ? 'y' : `y${plotCounter}`,
          marker: {
            color: '#878E95',
          },
          name: yLabel,
          // @ts-ignore
          hoveron: 'violins',
          ...sharedData,
        },
        yLabel: config.separation === EViolinSeparationMode.FACETS && yLabel,
      });
      plotCounter += 1;
    }
  }

  // Case: Numerical columns and multiple categorical columns selected
  else if (numColValues.length > 0 && catColValues.length > 0) {
    if (config.separation === EViolinSeparationMode.GROUP && (catColValues.length > 1 || numColValues.length > 1)) {
      hasFacets = false;
      let data: { y: number; x: string; group: { g1: string; g2: string }; ids: string }[] = [];
      numColValues.forEach((numCurr) => {
        catColValues.forEach((catCurr) => {
          const group =
            catColValues.length > 1 && numColValues.length > 1
              ? { g1: columnNameWithDescription(numCurr.info), g2: columnNameWithDescription(catCurr.info) }
              : numColValues.length > 1
                ? { g1: columnNameWithDescription(numCurr.info), g2: null }
                : { g1: columnNameWithDescription(catCurr.info), g2: null };

          numCurr.resolvedValues.forEach((v, i) =>
            data.push({
              y: v.val as number,
              x: catCurr.resolvedValues[i].val as string,
              group,
              ids: v.id?.toString(),
            }),
          );
        });
      });

      // Ensore NAN_REPLACEMENT is always at the end of the x-axis
      // This also ensures that plotly does not draw the violins if there are no y values for this group
      data = data.sort((a) => (a.x === NAN_REPLACEMENT ? 1 : -1));

      const groupedX = _.groupBy(data, 'x');
      selectedXMap = Object.keys(groupedX).reduce((acc, key) => {
        if (groupedX[key].some((v) => v.y !== null)) {
          acc[key] = groupedX[key].some((d) => selectedMap[d.ids]);
        }
        return acc;
      }, {});

      const groupedData = _.groupBy(data, (d) => d.group.g1 + d.group.g2);

      _.flatMap(groupedData, (group, key) => {
        plots.push({
          data: {
            y: group.map((g) => g.y),
            x: group.map((g) => g.x),
            ids: group.map((g) => g.ids),
            marker: {
              color: categoricalColors[plotCounter - 1],
            },
            // Cannot use transform for selection color of violins, as it overrides the violing grouping
            // @ts-ignore
            hoveron: 'violins',
            name: key,
            ...sharedData,
          },
          yLabel: numColValues.length === 1 && columnNameWithDescription(numColValues[0].info),
        });
        plotCounter += 1;
      });

      // Add legend trace for the group keys
      const legendData: { legendgroup?: string; elements: { val: string; color: string }[] }[] = [];
      if (numColValues.length > 1 && catColValues.length === 1) {
        legendData.push({
          legendgroup: null,
          elements: numColValues.map((num, idx) => ({ val: columnNameWithDescription(num.info), color: categoricalColors[idx] })),
        });
      } else if (numColValues.length === 1 && catColValues.length > 1) {
        legendData.push({
          legendgroup: null,
          elements: catColValues.map((cat, idx) => ({ val: columnNameWithDescription(cat.info), color: categoricalColors[idx] })),
        });
      } else if (numColValues.length > 1 && catColValues.length > 1) {
        numColValues.forEach((num, numIdx) => {
          legendData.push({
            legendgroup: columnNameWithDescription(num.info),
            elements: catColValues.map((cat, idx) => ({
              val: columnNameWithDescription(cat.info),
              color: categoricalColors[idx + numIdx * catColValues.length],
            })),
          });
        });
      }
      legendData.forEach((legend) => {
        legendPlots.push({
          data: {
            x: [null] as Plotly.Datum[],
            y: [null] as Plotly.Datum[],
            // @ts-ignore
            hoveron: 'violins',
            showlegend: true,
            type: 'violin',
            hoverinfo: 'skip',
            visible: 'legendonly',
            legendgroup: legend.legendgroup,
            legendgrouptitle: {
              text: legend.legendgroup,
            },
            transforms: [
              {
                type: 'groupby',
                groups: legend.elements.map((e) => e.val),
                styles: legend.elements.map((e) => {
                  return { target: e.val, value: { name: e.val, marker: { color: e.color } } };
                }),
              },
            ],
          },
        });
      });
    } else {
      hasFacets = true;
      numColValues.forEach((numCurr) => {
        catColValues.forEach((catCurr) => {
          const data: { y: number; x: string; ids: string }[] = catCurr.resolvedValues.map((v, i) => ({
            y: numCurr.resolvedValues[i].val as number,
            x: v.val as string,
            ids: numCurr.resolvedValues[i].id?.toString(),
          }));

          const groupedData = _.groupBy(data, 'x');

          _.flatMap(groupedData, (group, key) => {
            if (group.some((v) => v.y !== null)) {
              const ids = group.map((g) => g.ids);
              const x = group.map((g) => g.x);
              const y = group.map((g) => g.y);
              plots.push({
                data: {
                  y,
                  x,
                  ids,
                  xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                  yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                  marker: {
                    color: ids.find((id) => selectedMap[id]) ? SELECT_COLOR : '#878E95',
                  },
                  // Cannot use transform for selection color of violins, as it overrides the violing grouping
                  // @ts-ignore
                  hoveron: 'violins',
                  name: key,
                  ...sharedData,
                },
                xLabel: columnNameWithDescription(catCurr.info),
                yLabel: numColValues.length === 1 && columnNameWithDescription(numColValues[0].info),
              });
            }
          });
          plotCounter += 1;
        });
      });
    }
  }

  const defaultColNum = Math.min(Math.ceil(Math.sqrt(plotCounter - 1)), 5);

  return {
    plots,
    legendPlots,
    rows: Math.ceil((plotCounter - 1) / defaultColNum),
    cols: defaultColNum,
    errorMessage: i18n.t('visyn:vis.violinError'),
    errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
    hasFacets,
    selectedXMap,
  };
}
