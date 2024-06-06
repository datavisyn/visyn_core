import { ColumnInfo, PlotlyInfo, VisColumn } from '../interfaces';
import { PlotlyTypes } from '../../plotly';
import { VIS_AXIS_LABEL_SIZE, VIS_AXIS_LABEL_SIZE_SMALL, VIS_GRID_COLOR, VIS_LABEL_COLOR, VIS_TICK_LABEL_SIZE, VIS_TICK_LABEL_SIZE_SMALL } from './constants';

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
  xaxisOrder = null,
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
      layout.annotations.push({
        text: truncateText(t.title, true, 30),
        showarrow: false,
        x: 0.5,
        y: 1.0,
        yshift: 5,
        xref: `${t.data.xaxis} domain` as Plotly.XAxisName,
        yref: `${t.data.yaxis} domain` as Plotly.YAxisName,
        font: {
          size: 13.4,
          color: '#7f7f7f',
        },
      });
    }
  });

  sharedAxisTraces.forEach((t, i) => {
    const axisX = t.data.xaxis?.replace('x', 'xaxis') || 'xaxis';
    layout[axisX] = {
      ...oldLayout?.[`xaxis${i > 0 ? i + 1 : ''}`],
      range: t.xDomain ? t.xDomain : null,
      color: VIS_LABEL_COLOR,
      gridcolor: VIS_GRID_COLOR,
      // gridwidth: 2,
      // griddash: 'dash',
      zerolinecolor: VIS_GRID_COLOR,
      automargin,
      // rangemode: 'tozero',
      tickvals: t.xTicks,
      ticktext: t.xTickLabels,
      tickfont: {
        size: sharedAxisTraces.length > 1 ? VIS_TICK_LABEL_SIZE_SMALL : VIS_TICK_LABEL_SIZE,
      },
      ticks: 'none',
      text: t.xTicks,
      showspikes: false,
      spikedash: 'dash',
      categoryorder: xaxisOrder,

      title: {
        standoff: 5,
        text: sharedAxisTraces.length > 1 ? truncateText(t.xLabel, false, 20) : truncateText(t.xLabel, true, 55),
        font: {
          family: 'Roboto, sans-serif',
          size: sharedAxisTraces.length > 1 ? VIS_AXIS_LABEL_SIZE_SMALL : VIS_AXIS_LABEL_SIZE,
          color: VIS_LABEL_COLOR,
        },
      },
    };

    const axisY = t.data.yaxis?.replace('y', 'yaxis') || 'yaxis';
    layout[axisY] = {
      ...oldLayout?.[`yaxis${i > 0 ? i + 1 : ''}`],
      range: t.yDomain ? t.yDomain : null,
      automargin,
      autorange,
      color: VIS_LABEL_COLOR,
      gridcolor: VIS_GRID_COLOR,
      // gridwidth: 2,
      // griddash: 'dash',
      zerolinecolor: VIS_GRID_COLOR,
      // rangemode: 'tozero',
      tickvals: t.yTicks,
      ticktext: t.yTickLabels,
      tickfont: {
        size: sharedAxisTraces.length > 1 ? VIS_TICK_LABEL_SIZE_SMALL : VIS_TICK_LABEL_SIZE,
      },
      ticks: 'none',
      text: t.yTicks,
      showspikes: false,
      spikedash: 'dash',
      title: {
        standoff: 5,
        text: sharedAxisTraces.length > 1 ? truncateText(t.yLabel, false, 20) : truncateText(t.yLabel, true, 55),
        font: {
          family: 'Roboto, sans-serif',
          size: sharedAxisTraces.length > 1 ? VIS_AXIS_LABEL_SIZE_SMALL : VIS_AXIS_LABEL_SIZE,
          color: VIS_LABEL_COLOR,
          weight: 'bold',
        },
      },
    };
  });

  return layout;
}

export function resolveColumnValues(columns: VisColumn[]) {
  return Promise.all(columns.map(async (col) => ({ ...col, resolvedValues: (await col?.values()) || [] })));
}

export async function resolveSingleColumn(column: VisColumn) {
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
  const labelColumns = (await resolveColumnValues(columns.filter((c) => c.isLabel))).map((c) => c.resolvedValues);
  const labelsMap = labelColumns.reduce((acc, curr) => {
    curr.forEach((obj) => {
      if (acc[obj.id] == null) {
        acc[obj.id] = obj.val;
      }
    });
    return acc;
  }, {});
  return (id: string) => labelsMap[id] ?? id;
}
