import _ from 'lodash';
import merge from 'lodash/merge';
import { i18n } from '../../i18n';
import { categoricalColors } from '../../utils';
import { NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR } from '../general/constants';
import { columnNameWithDescription, resolveColumnValues } from '../general/layoutUtils';
import { EColumnTypes, ESupportedPlotlyVis, PlotlyData, PlotlyInfo, Scales, VisCategoricalColumn, VisColumn, VisNumericalColumn } from '../interfaces';
import { EViolinOverlay, EViolinSeparationMode, IViolinConfig } from './interfaces';

const defaultConfig: IViolinConfig = {
  type: ESupportedPlotlyVis.VIOLIN,
  numColumnsSelected: [],
  catColumnSelected: null,
  subCategorySelected: null,
  facetBy: null,
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

interface IGroupDefinition {
  num: { id: string; val: string };
  cat?: { id: string; val: string };
  subCat?: { id: string; val: string };
  facet?: { id: string; val: string };
  plotId: number;
}

interface IViolinDataRow {
  ids: string;
  x: string;
  y: number;
  groups: IGroupDefinition;
}

const concatGroup = (group: IGroupDefinition) => `${group.num.val}${group.cat?.val}${group.subCat?.val}${group.facet?.val}${group.plotId}`;

const alphaToHex = (alpha: number) => {
  const alphaInt = Math.round(alpha * 255);
  const alphaHex = alphaInt.toString(16).toUpperCase();
  return alphaHex.padStart(2, '0');
};

export async function createViolinTraces(
  columns: VisColumn[],
  config: IViolinConfig,
  scales: Scales,
  selectedList: string[],
  selectedMap: { [key: string]: boolean },
): Promise<PlotlyInfo & { violinMode: string; hasSplit: boolean }> {
  let plotCounter = 1;

  // Setting the opacity of the violins and point overlays here globally
  const baseOpacities =
    config.violinOverlay === EViolinOverlay.STRIP
      ? { selected: { line: 0.6, fill: 0.2, point: 1.0 }, unselected: { line: 0.2, fill: 0.2, point: 0.6 } }
      : { selected: { line: 0.8, fill: 0.6, point: 1.0 }, unselected: { line: 0.4, fill: 0.3, point: 1.0 } };

  if (!config.numColumnsSelected) {
    return {
      plots: [],
      legendPlots: [],
      rows: 0,
      cols: 0,
      violinMode: 'overlay',
      hasSplit: false,
      errorMessage: i18n.t('visyn:vis.violinError'),
      errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
    };
  }

  const numCols: VisNumericalColumn[] = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const catCol: VisCategoricalColumn = config.catColumnSelected
    ? (columns.find((col) => col.info.id === config.catColumnSelected.id) as VisCategoricalColumn)
    : null;
  const subCatCol: VisCategoricalColumn = config.subCategorySelected
    ? (columns.find((col) => col.info.id === config.subCategorySelected.id) as VisCategoricalColumn)
    : null;
  const facetCol: VisCategoricalColumn = config.facetBy ? (columns.find((col) => col.info.id === config.facetBy.id) as VisCategoricalColumn) : null;
  const plots: PlotlyData[] = [];
  const legendPlots: PlotlyData[] = [];

  const numColValues = await resolveColumnValues(numCols);
  // Null values in categorical columns would break the plot --> replace with NAN_REPLACEMENT
  const catColValues = (await catCol?.values())?.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })) || [];

  const facetColValues = (await facetCol?.values())?.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })) || [];
  const uniqueFacetValues = [...new Set(facetColValues.map((v) => v.val))];
  const subCatColValues = (await subCatCol?.values())?.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })) || [];
  const subCatMap: { [key: string]: { color: string; idx: number } } = [...new Set(subCatColValues.map((v) => v.val))].reduce((map, cat, idx) => {
    map[cat] = { color: categoricalColors[idx], idx };
    return map;
  }, {});
  const hasSplit = Object.keys(subCatMap).length === 2;

  // We do the grouping here to avoid having to do it in the plotly trace creation
  // This simplifies selection and highlighting of violins
  let data: IViolinDataRow[] = [];
  let currentPlotId = 1;
  numColValues.forEach((numCurr) => {
    if (!catCol) {
      numCurr.resolvedValues.forEach((v, i) => {
        const subCatVal = (subCatColValues[i]?.val as string) || null;
        data.push({
          ids: v.id?.toString(),
          x: columnNameWithDescription(numCurr.info),
          y: v.val as number,
          groups: {
            num: { id: columnNameWithDescription(numCurr.info), val: columnNameWithDescription(numCurr.info) },
            cat: null,
            subCat: subCatCol ? { id: columnNameWithDescription(subCatCol?.info), val: subCatVal } : null,
            facet: facetCol ? { id: columnNameWithDescription(facetCol.info), val: facetColValues[i].val as string } : null,
            plotId: currentPlotId,
          },
        });
      });
      if (config.separation === EViolinSeparationMode.FACETS) {
        currentPlotId += 1;
      }
    } else {
      numCurr.resolvedValues.forEach((v, i) => {
        const catVal = catColValues[i].val as string;
        const subCatVal = (subCatColValues[i]?.val as string) || null;
        data.push({
          ids: v.id?.toString(),
          x: catVal,
          y: v.val as number,
          groups: {
            num: { id: columnNameWithDescription(numCurr.info), val: columnNameWithDescription(numCurr.info) },
            cat: { id: columnNameWithDescription(catCol.info), val: catVal },
            subCat: subCatCol ? { id: columnNameWithDescription(subCatCol?.info), val: subCatVal } : null,
            facet: facetCol ? { id: columnNameWithDescription(facetCol.info), val: facetColValues[i].val as string } : null,
            plotId: currentPlotId,
          },
        });
      });
      currentPlotId += 1;
    }
  });

  // Ensore NAN_REPLACEMENT is always at the end of the x-axis
  // This also ensures that plotly does not draw the violins if there are no y values for this group
  data = data.sort((a) => (a.x === NAN_REPLACEMENT ? 1 : -1));
  const groupedData = _.groupBy(data, (d) => concatGroup(d.groups));

  // Common data for all violin traces
  const sharedData = {
    type: 'violin' as Plotly.PlotType,
    jitter: 0.3,
    points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
    box: {
      width: hasSplit ? 0.5 : 0.3,
      visible: config.violinOverlay === EViolinOverlay.BOX,
    },
    spanmode: 'hard',
    hoverinfo: 'y',
    scalemode: 'width',
    showlegend: false,
  };

  // Add new trace for each violin
  _.flatMap(groupedData, (group) => {
    const { plotId, facet, subCat } = group[0].groups;
    const isSelected = selectedList.length > 0 && group.some((g) => selectedMap[g.ids]);
    const opacities = selectedList.length > 0 ? (isSelected ? baseOpacities.selected : baseOpacities.unselected) : baseOpacities.selected;
    const patchedPlotId = facet ? numCols.length * uniqueFacetValues.indexOf(facet.val) + plotId : plotId;
    if (patchedPlotId > plotCounter) {
      plotCounter = patchedPlotId;
    }
    const ids = group.map((g) => g.ids);
    plots.push({
      data: {
        y: group.map((g) => g.y),
        x: group.map((g) => g.x),
        xaxis: patchedPlotId === 1 ? 'x' : `x${patchedPlotId}`,
        yaxis: patchedPlotId === 1 ? 'y' : `y${patchedPlotId}`,
        ids,
        side: subCat && hasSplit ? (subCatMap[subCat.val].idx === 0 ? 'positive' : 'negative') : null,
        pointpos: subCat && hasSplit ? (subCatMap[subCat.val].idx === 0 ? 0.5 : -0.5) : 0,
        fillcolor: subCat
          ? selectedList.length === 0 || isSelected
            ? `${subCatMap[subCat.val].color}${alphaToHex(opacities.fill)}`
            : `${VIS_NEUTRAL_COLOR}${alphaToHex(opacities.fill)}`
          : isSelected
            ? `${SELECT_COLOR}${alphaToHex(opacities.fill)}`
            : `${VIS_NEUTRAL_COLOR}${alphaToHex(opacities.fill)}`,
        marker: {
          color: subCat
            ? selectedList.length === 0 || isSelected
              ? `${subCatMap[subCat.val].color}${alphaToHex(opacities.line)}`
              : `${VIS_NEUTRAL_COLOR}${alphaToHex(opacities.line)}`
            : isSelected
              ? `${SELECT_COLOR}${alphaToHex(opacities.line)}`
              : `${VIS_NEUTRAL_COLOR}${alphaToHex(opacities.line)}`,
        },
        selectedpoints: ids.reduce((acc, id, i) => (selectedMap[id] ? acc.concat(i) : acc), [] as number[]),
        selected: {
          marker: {
            color: SELECT_COLOR,
            opacity: baseOpacities.selected.point,
          },
        },
        unselected: {
          marker: {
            color: VIS_NEUTRAL_COLOR,
            opacity: baseOpacities.unselected.point,
          },
        },
        // @ts-ignore
        hoveron: config.violinOverlay === EViolinOverlay.STRIP ? 'violins+points' : 'violins',
        name: subCat?.val,
        scalegroup: subCat?.val,
        legendgroup: subCat?.val,
        ...sharedData,
      },
      yLabel: group[0].groups.num.id,
      xLabel: catCol ? group[0].groups.cat.id : null,
      title: facetCol ? `${columnNameWithDescription(facetCol.info)} - ${group[0].groups.facet.val}` : null,
    });
  });

  // Add separate legend
  if (subCatCol) {
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
        // legendgroup: legend.legendgroup,
        // legendgrouptitle: {
        //   text: legend.legendgroup,
        // },
        transforms: [
          {
            type: 'groupby',
            groups: Object.keys(subCatMap),
            styles: Object.keys(subCatMap).map((e) => {
              return { target: e, value: { name: e, marker: { color: subCatMap[e].color } } };
            }),
          },
        ],
      },
    });
  }

  // Try to get the best grid layout
  const cols = Math.min(Math.ceil(Math.sqrt(plotCounter)), 5);
  const rows = Math.ceil(plotCounter / cols);

  return {
    plots,
    legendPlots,
    rows,
    cols,
    errorMessage: i18n.t('visyn:vis.violinError'),
    errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
    violinMode: Object.keys(subCatMap).length > 2 ? 'group' : 'overlay',
    hasSplit,
  };
}
