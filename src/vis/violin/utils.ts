import { cloneDeep, groupBy, mean, merge, orderBy, sumBy } from 'lodash';
import { i18n } from '../../i18n';
import { categoricalColors } from '../../utils';
import { IBoxplotConfig } from '../boxplot';
import { ESortStates } from '../general/SortIcon';
import { NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_OPACITY } from '../general/constants';
import { alphaToHex, columnNameWithDescription, resolveColumnValues, truncateText } from '../general/layoutUtils';
import { EColumnTypes, ESupportedPlotlyVis, PlotlyData, PlotlyInfo, VisCategoricalColumn, VisColumn, VisNumericalColumn } from '../interfaces';
import { EViolinOverlay, EYAxisMode, IViolinConfig, isViolinConfig } from './interfaces';

const defaultViolinConfig: IViolinConfig = {
  type: ESupportedPlotlyVis.VIOLIN,
  numColumnsSelected: [],
  catColumnSelected: null,
  subCategorySelected: null,
  facetBy: null,
  overlay: EViolinOverlay.NONE,
  syncYAxis: EYAxisMode.UNSYNC,
};

const defaultBoxplotConfig: IBoxplotConfig = {
  type: ESupportedPlotlyVis.BOXPLOT,
  numColumnsSelected: [],
  catColumnSelected: null,
  subCategorySelected: null,
  facetBy: null,
  overlay: EViolinOverlay.NONE,
  syncYAxis: EYAxisMode.UNSYNC,
};

export function violinBoxMergeDefaultConfig<T extends IViolinConfig | IBoxplotConfig>(columns: VisColumn[], config: T): T {
  let merged = {} as T;
  if (isViolinConfig(config)) {
    merged = merge({}, defaultViolinConfig, config) as T;
  } else {
    merged = merge({}, defaultBoxplotConfig, config) as T;
    if (merged.overlay === EViolinOverlay.BOX) {
      merged.overlay = EViolinOverlay.NONE;
    }
  }

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

export async function createViolinTraces(
  columns: VisColumn[],
  config: IViolinConfig | IBoxplotConfig,
  sortBy: { col: string; state: ESortStates },
  selectedList: string[],
  selectedMap: { [key: string]: boolean },
): Promise<PlotlyInfo & { violinMode: string; hasSplit: boolean; categoryOrder: Map<number, string[]> }> {
  let plotCounter = 1;

  // Setting the opacity of the violins and point overlays here globally
  const baseOpacities =
    config.overlay === EViolinOverlay.STRIP
      ? { selected: { line: 0.6, fill: 0.2, point: 1.0 }, unselected: { line: 0.2, fill: 0.2, point: 0.6 } }
      : { selected: { line: 0.8, fill: 0.6, point: 1.0 }, unselected: { line: VIS_UNSELECTED_OPACITY * 1.3, fill: VIS_UNSELECTED_OPACITY, point: 1.0 } };

  if (!config.numColumnsSelected) {
    return {
      plots: [],
      legendPlots: [],
      rows: 0,
      cols: 0,
      violinMode: 'overlay',
      hasSplit: false,
      categoryOrder: null,
      errorMessage: i18n.t('visyn:vis.missingColumn.violinError'),
      errorMessageHeader: i18n.t('visyn:vis.missingColumn.errorHeader'),
    };
  }

  const numCols: VisNumericalColumn[] = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const catCol: VisCategoricalColumn = config.catColumnSelected
    ? (columns.find((col) => col.info.id === config.catColumnSelected.id) as VisCategoricalColumn)
    : null;
  const subCatCol: VisCategoricalColumn = config.subCategorySelected
    ? (columns.find((col) => col.info.id === config.subCategorySelected.id) as VisCategoricalColumn)
    : null;
  const facetCol: VisCategoricalColumn =
    config.facetBy && numCols.length === 1 ? (columns.find((col) => col.info.id === config.facetBy.id) as VisCategoricalColumn) : null;
  const plots: PlotlyData[] = [];
  const legendPlots: PlotlyData[] = [];

  const numColValues = await resolveColumnValues(numCols);
  // Null values in categorical columns would break the plot --> replace with NAN_REPLACEMENT
  const catColValues = (await catCol?.values())?.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })) || [];
  const uniqueCatColValues = [...new Set(catColValues.map((v) => v.val))];
  const facetColValues = (await facetCol?.values())?.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })) || [];
  const uniqueFacetValues = [...new Set(facetColValues.map((v) => v.val))];
  const subCatColValues = (await subCatCol?.values())?.map((v) => ({ ...v, val: v.val || NAN_REPLACEMENT })) || [];
  const subCatMap: { [key: string]: { color: string; idx: number } } = {};

  // NOTE: Special use-case
  // When using the y-ais option merged and with categorical column set we treat the numerical columns as subCategory
  const numColsAsSubcat = config.syncYAxis === EYAxisMode.MERGED && catCol !== null;

  // We do the grouping here to avoid having to do it in the plotly trace creation
  // This simplifies selection and highlighting of violins
  let data: IViolinDataRow[] = [];
  const dataRange: { min: number; max: number } = { min: null, max: null };
  const updateDataRange = (val: number) => {
    if (!dataRange.max || val < dataRange.min) {
      dataRange.min = val;
    }
    if (!dataRange.max || val > dataRange.max) {
      dataRange.max = val;
    }
  };

  let currentPlotId = 1;
  numColValues.forEach((numCurr) => {
    if (!catCol) {
      numCurr.resolvedValues.forEach((v, i) => {
        if (v.val) {
          updateDataRange(v.val as number);
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

          if (!subCatMap[subCatVal]) {
            subCatMap[subCatVal] = {
              color: subCatVal === NAN_REPLACEMENT ? VIS_NEUTRAL_COLOR : categoricalColors[Object.keys(subCatMap).length % categoricalColors.length],
              idx: Object.keys(subCatMap).length,
            };
          }
        }
      });
      currentPlotId += 1;
    } else {
      numCurr.resolvedValues.forEach((v, i) => {
        if (v.val) {
          const catVal = catColValues[i].val as string;
          const subCatVal = numColsAsSubcat ? columnNameWithDescription(numCurr.info) : (subCatColValues[i]?.val as string) || null;
          updateDataRange(v.val as number);
          data.push({
            ids: v.id?.toString(),
            x: catVal,
            y: v.val as number,
            groups: {
              num: { id: columnNameWithDescription(numCurr.info), val: columnNameWithDescription(numCurr.info) },
              cat: { id: columnNameWithDescription(catCol.info), val: catVal },
              subCat: numColsAsSubcat
                ? { id: columnNameWithDescription(numCurr.info), val: subCatVal }
                : subCatCol
                  ? { id: columnNameWithDescription(subCatCol?.info), val: subCatVal }
                  : null,
              facet: facetCol ? { id: columnNameWithDescription(facetCol.info), val: facetColValues[i].val as string } : null,
              plotId: currentPlotId,
            },
          });

          if (!subCatMap[subCatVal]) {
            subCatMap[subCatVal] = {
              color: subCatVal === NAN_REPLACEMENT ? VIS_NEUTRAL_COLOR : categoricalColors[Object.keys(subCatMap).length % categoricalColors.length],
              idx: Object.keys(subCatMap).length,
            };
          }
        }
      });
      currentPlotId += 1;
    }
  });

  // Ensure NAN_REPLACEMENT is always at the end of the x-axis
  // This also ensures that plotly does not draw the violins if there are no y values for this group
  data = data.sort((a) => (a.x === NAN_REPLACEMENT ? 1 : -1));
  // Continue with the rest of the code...
  const groupedData = groupBy(data, (d) => concatGroup(d.groups));

  // Apply domain sorting
  const catOrder = new Set([...(catCol?.domain ?? []), ...uniqueCatColValues]);
  const subCatOrder = new Set([...(subCatCol?.domain ?? []), ...Object.keys(subCatMap)]);
  const facetOrder = new Set(
    facetCol?.domain
      ? [...facetCol.domain, NAN_REPLACEMENT]
      : (uniqueFacetValues as string[]).sort((a, b) =>
          a?.toLowerCase() === NAN_REPLACEMENT ? 1 : b?.toLowerCase() === NAN_REPLACEMENT ? -1 : a?.localeCompare(b, undefined, { sensitivity: 'base' }),
        ),
  );
  const groupKeysSorted = Object.keys(groupedData).sort((a, b) => {
    const groupA = groupedData[a][0].groups;
    const groupB = groupedData[b][0].groups;
    const catIndexA = groupA.cat ? (catOrder.has(groupA.cat.val) ? [...catOrder].indexOf(groupA.cat.val) : Infinity) : Infinity;
    const catIndexB = groupB.cat ? (catOrder.has(groupB.cat.val) ? [...catOrder].indexOf(groupB.cat.val) : Infinity) : Infinity;
    const subCatIndexA = groupA.subCat ? (subCatOrder.has(groupA.subCat.val) ? [...subCatOrder].indexOf(groupA.subCat.val) : Infinity) : Infinity;
    const subCatIndexB = groupB.subCat ? (subCatOrder.has(groupB.subCat.val) ? [...subCatOrder].indexOf(groupB.subCat.val) : Infinity) : Infinity;
    const facetIndexA = groupA.facet ? (facetOrder.has(groupA.facet.val) ? [...facetOrder].indexOf(groupA.facet.val) : Infinity) : Infinity;
    const facetIndexB = groupB.facet ? (facetOrder.has(groupB.facet.val) ? [...facetOrder].indexOf(groupB.facet.val) : Infinity) : Infinity;
    // Ensure that NAN_REPLACEMENT is always at the end
    const nanIndexA = groupedData[a][0].x === NAN_REPLACEMENT ? Infinity : -Infinity;
    const nanIndexB = groupedData[b][0].x === NAN_REPLACEMENT ? Infinity : -Infinity;
    return catIndexA - catIndexB || subCatIndexA - subCatIndexB || facetIndexA - facetIndexB || nanIndexA - nanIndexB;
  });

  // Create subcategory map for coloring and legend
  [...subCatOrder].forEach((v, i) => {
    subCatMap[v] = { color: v === NAN_REPLACEMENT ? VIS_NEUTRAL_COLOR : categoricalColors[i % categoricalColors.length], idx: i };
  });

  // Only allow split mode if there are exactly two subcategories and the plot type is violin
  const hasSplit = config.type === ESupportedPlotlyVis.VIOLIN && Object.keys(subCatMap).length === 2;

  // Sort by mean if order is set
  let categoryOrder = null;
  if (sortBy?.col && sortBy?.state !== ESortStates.NONE) {
    const filteredGroupKeys = Object.keys(groupedData).filter((g) => g.includes(sortBy.col));

    // Sort by mean value for selected y axis
    if (filteredGroupKeys.length > 0) {
      const meanValues = filteredGroupKeys.map((g) => {
        const group = groupedData[g];
        const values = group.map((d) => d.y);
        return { key: g, mean: mean(values), cat: group[0].groups.cat?.val || group[0].groups.num.val };
      });

      const summedMeanValues = Object.values(groupBy(meanValues, (m) => m.cat)).map((group) => ({ key: group[0].cat, mean: sumBy(group, 'mean') }));
      const sortedGroups = orderBy(summedMeanValues, ['mean'], [sortBy.state === ESortStates.ASC ? 'asc' : 'desc']);
      const sortedCategories = sortedGroups.map((g) => g.key);
      categoryOrder = [...new Set(sortedCategories)];
    }
    // Sort alphabetically for selected x axis
    else {
      const sortedCategories = Object.keys(groupedData).map((g) => groupedData[g][0].groups.cat?.val || groupedData[g][0].groups.num.val);
      categoryOrder = sortBy.state === ESortStates.ASC ? sortedCategories.sort() : sortedCategories.sort().reverse();
    }
  }

  const boxplotData =
    config.type === ESupportedPlotlyVis.BOXPLOT
      ? {
          type: 'box',
          boxmean: true,
          boxpoints: config.overlay === EViolinOverlay.STRIP ? 'all' : false,
        }
      : {};

  const violinData =
    config.type === ESupportedPlotlyVis.VIOLIN
      ? {
          type: 'violin',
          bandwidth: 0,
          box: {
            width: hasSplit ? 0.5 : 0.3,
            visible: config.overlay === EViolinOverlay.BOX,
          },
          points: config.overlay === EViolinOverlay.STRIP ? 'all' : false,
        }
      : {};

  // Common data for all violin traces
  const sharedData = {
    ...violinData,
    ...boxplotData,
    jitter: hasSplit ? 0.2 : 0.6,
    hoverlabel: {
      font: {
        color: 'rgba(0,0,0,0.75)',
        size: 12,
      },
      namelength: 100,
    },
    spanmode: 'hard',
    hoverinfo: 'y+name',
    scalemode: 'width',
    showlegend: false,
  };

  const categoriesPerPlot = new Map<number, string[]>();

  // Add new trace for each violin
  groupKeysSorted.forEach((key) => {
    const group = groupedData[key];
    const { plotId, facet, subCat, cat, num } = group[0].groups;
    const isSelected = selectedList.length > 0 && group.some((g) => selectedMap[g.ids]);
    const opacities = selectedList.length > 0 ? (isSelected ? baseOpacities.selected : baseOpacities.unselected) : baseOpacities.selected;
    const patchedPlotId = config.syncYAxis === EYAxisMode.MERGED ? 1 : facet ? numCols.length * [...facetOrder].indexOf(facet.val) + plotId : plotId;
    if (patchedPlotId > plotCounter) {
      plotCounter = patchedPlotId;
    }
    const ids = group.map((g) => g.ids);

    if (!categoriesPerPlot.has(patchedPlotId)) {
      categoriesPerPlot.set(patchedPlotId, []);
    }
    categoriesPerPlot.get(patchedPlotId).push(cat?.val || num.val);

    plots.push({
      data: {
        y: group.map((g) => g.y),
        x: group.map((g) => g.x),
        xaxis: patchedPlotId === 1 ? 'x' : `x${patchedPlotId}`,
        yaxis: patchedPlotId === 1 ? 'y' : `y${patchedPlotId}`,
        ids,
        side: subCat && hasSplit ? (subCatMap[subCat.val].idx === 0 ? 'negative' : 'positive') : null,
        width: hasSplit ? 0.8 : null,
        pointpos: subCat && hasSplit ? (subCatMap[subCat.val].idx === 0 ? -0.5 : 0.5) : 0,
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
        name: subCat ? subCat.val : cat ? cat.val : num.val,
        offsetgroup: subCat?.val,
        ...sharedData,
      },
      yLabel: config.syncYAxis === EYAxisMode.MERGED ? 'Merged axis' : group[0].groups.num.id,
      xLabel: catCol ? group[0].groups.cat.id : null,
      title: facetCol ? `${columnNameWithDescription(facetCol.info)} - ${group[0].groups.facet.val}` : null,
      yDomain: [EYAxisMode.SYNC, EYAxisMode.MERGED].includes(config.syncYAxis) ? [dataRange.min, dataRange.max] : null,
    });
  });

  // ensure that every positive or negative violin side has a corresponding negative or positive dummy side
  if (hasSplit) {
    plots.forEach((p) => {
      // @ts-ignore
      if (p.data.side === 'negative' && p.data.x.length > 0) {
        // @ts-ignore
        const positiveSide = plots.find((p2) => p2.data.side === 'positive' && p2.data.xaxis === p.data.xaxis && p2.data.yaxis === p.data.yaxis);
        if (!positiveSide) {
          const newPlot = cloneDeep(p);
          // @ts-ignore
          newPlot.data.side = 'positive';
          newPlot.data.y = [0];
          newPlot.data.opacity = 0;
          plots.push(newPlot);
        }
        // @ts-ignore
      } else if (p.data.side === 'positive' && p.data.x.length > 0) {
        // @ts-ignore
        const negativeSide = plots.find((p2) => p2.data.side === 'negative' && p2.data.xaxis === p.data.xaxis && p2.data.yaxis === p.data.yaxis);
        if (!negativeSide) {
          const newPlot = cloneDeep(p);
          // @ts-ignore
          newPlot.data.side = 'negative';
          newPlot.data.y = [0];
          newPlot.data.opacity = 0;
          plots.push(newPlot);
        }
      }
    });
  }

  // Add separate legend
  if (numColsAsSubcat || subCatCol) {
    legendPlots.push({
      data: {
        x: [null] as Plotly.Datum[],
        y: [null] as Plotly.Datum[],
        // @ts-ignore
        hoveron: 'violins',
        showlegend: true,
        type: 'violin',
        hoverinfo: 'skip',
        legendgrouptitle: subCatCol && {
          text: truncateText(columnNameWithDescription(subCatCol.info), true, 20),
        },
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

  // Sort the categories per plot by categoryOrder
  categoriesPerPlot.forEach((categories, plotId) => {
    categoriesPerPlot.set(
      plotId,
      categories.sort((a, b) => {
        const indexA = categoryOrder?.indexOf(a) ?? Infinity;
        const indexB = categoryOrder?.indexOf(b) ?? Infinity;
        return indexA - indexB;
      }),
    );
  });

  return {
    plots,
    legendPlots,
    rows,
    cols,
    categoryOrder: categoriesPerPlot,
    errorMessage: i18n.t('visyn:vis.missingColumn.violinError'),
    errorMessageHeader: i18n.t('visyn:vis.missingColumn.errorHeader'),
    violinMode: (numColsAsSubcat || subCatCol) && !hasSplit ? 'group' : 'overlay',
    hasSplit,
  };
}
