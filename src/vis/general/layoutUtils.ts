import type { PlotlyTypes } from '../../plotly';
import type { ColumnInfo, PlotlyInfo, VisColumn } from '../interfaces';
import {
  VIS_AXIS_LABEL_SIZE,
  VIS_AXIS_LABEL_SIZE_SMALL,
  VIS_GRID_COLOR,
  VIS_LABEL_COLOR,
  VIS_TICK_LABEL_SIZE,
  VIS_TICK_LABEL_SIZE_SMALL,
  VIS_TRACES_COLOR,
} from './constants';

/**
 *
 * @param alpha Alpha value from 0-1 to convert to hex representation
 * @returns Hex representation of the given alpha value
 */
export const alphaToHex = (alpha: number) => {
  const alphaInt = Math.round(alpha * 255);
  const alphaHex = alphaInt.toString(16).toUpperCase();
  return alphaHex.padStart(2, '0');
};

/**
 * Truncate long texts (e.g., to use as axes title)
 * @param text Input text to be truncated
 * @param middle If true, truncate from the middle (default: false)
 * @param maxLength Maximum text length (default: 50)
 */
export function truncateText(text: string, middle: boolean = false, maxLength = 50) {
  const half = maxLength / 2;
  return text?.length > maxLength
    ? middle
      ? `${text.substring(0, half)}\u2026${text.substring(text.length - half)}`
      : `${text.substring(0, maxLength)}\u2026`
    : text;
}

export function columnNameWithDescription(col: ColumnInfo) {
  return col?.description ? `${col.name}: ${col.description}` : col.name;
}

/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.p
 * @returns the changed layout
 */
export function beautifyLayout(
  traces: PlotlyInfo,
  layout: Partial<PlotlyTypes.Layout>,
  oldLayout: Partial<PlotlyTypes.Layout>,
  categoryOrder: Map<number, string[]> | null = null,
  automargin = true,
  autorange = true,
) {
  layout.annotations = [];

  // Sometimes we have multiple traces that share the same axis. For layout changes we only need to consider one per axis.
  const sharedAxisTraces = traces.plots.filter((value, index, self) => {
    return self.findIndex((v) => v.data.xaxis === value.data.xaxis && v.data.yaxis === value.data.yaxis) === index;
  });

  const titleTraces = sharedAxisTraces.filter((value, index, self) => {
    return value.title && self.findIndex((v) => v.title === value.title) === index;
  });

  // This is for adding titles to subplots, specifically for bar charts with small facets.
  // As explained here https://github.com/plotly/plotly.js/issues/2746#issuecomment-810354140, this doesnt work very well if you have a lot of subplots because plotly.
  // "So above and beyond the fact that Plotly.js doesn't have a first-class "subplot" concept,
  // Plotly.js also doesn't really do any kind of automated layout beyond automatically growing the plot margins to leave enough room for legends"

  // We should stop using plotly for a component like this one which wants a lot of unique functionality, and does not require complex rendering logic (like a canvas)

  titleTraces.forEach((t) => {
    if (t.title) {
      layout.annotations?.push({
        text: truncateText(t.title, true, 30),
        showarrow: false,
        x: 0.5,
        y: 1.0,
        yshift: 5,
        xref: `${t.data.xaxis} domain` as Plotly.XAxisName,
        yref: `${t.data.yaxis} domain` as Plotly.YAxisName,
        font: {
          size: 13.4,
          color: VIS_TRACES_COLOR,
        },
      });
    }
  });

  sharedAxisTraces.forEach((t, i) => {
    const xAxis = (t.data.xaxis?.replace('x', 'xaxis') || 'xaxis') as 'xaxis';
    const indexedXAxis = `${xAxis}${i > 0 ? i + 1 : ''}` as `xaxis${2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

    layout[xAxis] = {
      ...oldLayout?.[indexedXAxis],
      range: t.xDomain ? t.xDomain : undefined,
      color: VIS_LABEL_COLOR,
      gridcolor: VIS_GRID_COLOR,
      zerolinecolor: VIS_GRID_COLOR,
      automargin,
      tickvals: t.xTicks,
      ticktext: t.xTickLabels,
      tickfont: {
        size: sharedAxisTraces.length > 1 ? +VIS_TICK_LABEL_SIZE_SMALL : +VIS_TICK_LABEL_SIZE,
      },
      type: typeof t.data.x?.[0] === 'string' ? 'category' : undefined,
      ticks: undefined,
      showspikes: false,
      spikedash: 'dash',
      categoryarray: categoryOrder?.get(i + 1) || undefined,
      categoryorder: categoryOrder?.get(i + 1) ? 'array' : undefined,

      title: {
        standoff: 5,
        text: sharedAxisTraces.length > 1 ? truncateText(t.xLabel, false, 20) : truncateText(t.xLabel, true, 55),
        font: {
          family: 'Roboto, sans-serif',
          size: sharedAxisTraces.length > 1 ? +VIS_AXIS_LABEL_SIZE_SMALL : +VIS_AXIS_LABEL_SIZE,
          color: VIS_LABEL_COLOR,
        },
      },
    };

    const yAxis = (t.data.yaxis?.replace('y', 'yaxis') || 'yaxis') as 'yaxis';
    const indexedYAxis = `${yAxis}${i > 0 ? i + 1 : ''}` as `yaxis${2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

    layout[yAxis] = {
      ...oldLayout?.[indexedYAxis],
      range: t.yDomain ? t.yDomain : undefined,
      automargin,
      autorange,
      color: VIS_LABEL_COLOR,
      gridcolor: VIS_GRID_COLOR,
      zerolinecolor: VIS_GRID_COLOR,
      tickvals: t.yTicks,
      ticktext: t.yTickLabels,
      tickfont: {
        size: sharedAxisTraces.length > 1 ? +VIS_TICK_LABEL_SIZE_SMALL : +VIS_TICK_LABEL_SIZE,
      },
      type: typeof t.data.y?.[0] === 'string' ? 'category' : undefined,
      ticks: undefined,
      showspikes: false,
      spikedash: 'dash',
      title: {
        standoff: 5,
        text: sharedAxisTraces.length > 1 ? truncateText(t.yLabel, false, 20) : truncateText(t.yLabel, true, 55),
        font: {
          family: 'Roboto, sans-serif',
          size: sharedAxisTraces.length > 1 ? +VIS_AXIS_LABEL_SIZE_SMALL : +VIS_AXIS_LABEL_SIZE,
          color: VIS_LABEL_COLOR,
        },
      },
    };
  });

  return layout;
}

export function resolveColumnValues(columns: VisColumn[]) {
  return Promise.all(columns.map(async (col) => ({ ...col, resolvedValues: (await col?.values()) || [] })));
}

export async function resolveSingleColumn(column: VisColumn | null) {
  if (!column) {
    return null;
  }

  return {
    ...column,
    resolvedValues: await column.values(),
  };
}

/**
 * Creates mapping function from label column. If more label columns are provided, the first one is used, the rest are used as fallback.
 * @param {VisColumn[]} columns - The columns to map.
 * @returns {Function} Function mapping ID to label or ID itself.
 */
export async function createIdToLabelMapper(columns: VisColumn[]): Promise<(id: string) => string> {
  const labelColumns = columns.filter((c) => c.info.isLabel);
  const resolvedLabelColumnValues = (await resolveColumnValues(labelColumns)).map((c) => c.resolvedValues);
  const labelsMap = resolvedLabelColumnValues.reduce(
    (acc, curr) => {
      curr.forEach((obj) => {
        const labelInfoString = `${obj.val as string}`;
        if (acc[obj.id as string] == null) {
          acc[obj.id as string] = labelInfoString;
        } else {
          acc[obj.id as string] = `${acc[obj.id as string]}, ${labelInfoString}`;
        }
      });
      return acc;
    },
    {} as { [key: string]: string },
  );

  return (id: string) => labelsMap[id] ?? id;
}
