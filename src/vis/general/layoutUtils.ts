import { ColumnInfo, PlotlyInfo, VisColumn } from '../interfaces';
import { PlotlyTypes } from '../../plotly';

/**
 * Truncate long texts (e.g., to use as axes title)
 * @param text Input text to be truncated
 * @param maxLength Maximum text length (default: 50)
 */
export function truncateText(text: string, maxLength = 50) {
  return text?.length > maxLength ? `${text.substring(0, maxLength)}\u2026` : text;
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
export function beautifyLayout(traces: PlotlyInfo, layout: Partial<PlotlyTypes.Layout>, oldLayout: Partial<PlotlyTypes.Layout>, automargin = true) {
  layout.annotations = [];
  const titlePlots = traces.plots.filter((value, index, self) => {
    return value.title && self.findIndex((v) => v.title === value.title) === index;
  });

  // This is for adding titles to subplots, specifically for bar charts with small facets.
  // As explained here https://github.com/plotly/plotly.js/issues/2746#issuecomment-810354140, this doesnt work very well if you have a lot of subplots because plotly.
  // "So above and beyond the fact that Plotly.js doesn't have a first-class "subplot" concept,
  // Plotly.js also doesn't really do any kind of automated layout beyond automatically growing the plot margins to leave enough room for legends"

  // We should stop using plotly for a component like this one which wants a lot of unique functionality, and does not require complex rendering logic (like a canvas)

  titlePlots.forEach((t) => {
    if (t.title) {
      layout.annotations.push({
        text: t.title,
        showarrow: false,
        x: 0.5,
        y: 1.1,
        // @ts-ignore
        xref: `${t.data.xaxis} domain`,
        // @ts-ignore
        yref: `${t.data.yaxis} domain`,
      });
    }
  });

  const plotFrame = {
    showline: true,
    linecolor: 'rgb(238, 238, 238)',
    linewidth: 2,
    mirror: true,
  };

  traces.plots.forEach((t, i) => {
    layout[`xaxis${i > 0 ? i + 1 : ''}`] = {
      range: t.xDomain ? t.xDomain : null,
      ...oldLayout?.[`xaxis${i > 0 ? i + 1 : ''}`],
      automargin,
      // rangemode: 'tozero',
      tickvals: t.xTicks,
      ticktext: t.xTickLabels,
      text: t.xTicks,
      showspikes: false,
      spikedash: 'dash',
      ticks: 'outside',
      zerolinecolor: 'rgb(238, 238, 238)',
      title: {
        standoff: 5,
        text: traces.plots.length > 1 ? truncateText(t.xLabel, 25) : truncateText(t.xLabel, 50),
        font: {
          family: 'Roboto, sans-serif',
          size: traces.plots.length > 1 ? 12 : 13.4,
          color: '#7f7f7f',
        },
      },
      ...plotFrame,
    };

    layout[`yaxis${i > 0 ? i + 1 : ''}`] = {
      range: t.yDomain ? t.yDomain : null,
      ...oldLayout?.[`yaxis${i > 0 ? i + 1 : ''}`],
      automargin,
      // rangemode: 'tozero',
      tickvals: t.yTicks,
      ticktext: t.yTickLabels,
      text: t.yTicks,
      showspikes: false,
      spikedash: 'dash',
      ticks: 'outside',
      zerolinecolor: 'rgb(238, 238, 238)',
      title: {
        standoff: 5,
        text: traces.plots.length > 1 ? truncateText(t.yLabel, 30) : truncateText(t.yLabel, 50),
        font: {
          family: 'Roboto, sans-serif',
          size: traces.plots.length > 1 ? 12 : 13.4,
          color: '#7f7f7f',
        },
      },
      ...plotFrame,
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
