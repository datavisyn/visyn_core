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
  return col.description ? `${col.name}: ${col.description}` : col.name;
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

  // This is for adding titles to subplots, specifically for bar charts with small multiples.
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

  traces.plots.forEach((t, i) => {
    layout[`xaxis${i > 0 ? i + 1 : ''}`] = {
      range: t.xDomain ? t.xDomain : null,
      ...oldLayout?.[`xaxis${i > 0 ? i + 1 : ''}`],
      // automargin,
      rangemode: 'tozero',
      // tickvals: t.xTicks,
      // ticktext: t.xTickLabels,
      // text: t.xTicks,
      // showline: false,
      // showspikes: false,
      // spikedash: 'dash',
      // ticks: 'outside',
      title: {
        standoff: 5,
        text: traces.plots.length > 1 ? truncateText(t.xLabel, 15) : truncateText(t.xLabel, 50),
        font: {
          family: 'Roboto, sans-serif',
          size: traces.plots.length > 1 ? 10 : 14,
          color: '#7f7f7f',
        },
      },
    };

    layout[`yaxis${i > 0 ? i + 1 : ''}`] = {
      range: t.yDomain ? t.yDomain : null,
      ...oldLayout?.[`yaxis${i > 0 ? i + 1 : ''}`],
      automargin,
      // rangemode: 'tozero',
      tickvals: t.yTicks,
      ticktext: t.yTickLabels,
      text: t.yTicks,
      showline: false,
      showspikes: false,
      spikedash: 'dash',
      ticks: 'outside',
      title: {
        standoff: 5,
        text: traces.plots.length > 1 ? truncateText(t.yLabel, 15) : truncateText(t.yLabel, 50),
        font: {
          family: 'Roboto, sans-serif',
          size: traces.plots.length > 1 ? 10 : 14,
          color: '#7f7f7f',
        },
      },
    };

    layout.shapes.push({
      type: 'line',
      // @ts-ignore
      xref: `${t.data.xaxis} domain`,
      // @ts-ignore
      yref: `${t.data.yaxis} domain`,
      x0: 0,
      y0: 1,
      x1: 1,
      y1: 1,
      line: {
        color: 'rgb(238, 238, 238)',
        width: 2,
      },
      opacity: 1,
      row: 2,
      col: 2,
    });

    layout.shapes.push({
      type: 'line',
      // @ts-ignore
      xref: `${t.data.xaxis} domain`,
      // @ts-ignore
      yref: `${t.data.yaxis} domain`,
      x0: 0,
      y0: 0,
      x1: 1,
      y1: 0,
      line: {
        color: 'rgb(238, 238, 238)',
        width: 2,
      },
      opacity: 1,
      row: 2,
      col: 2,
    });

    layout.shapes.push({
      type: 'line',
      // @ts-ignore
      xref: `${t.data.xaxis} domain`,
      // @ts-ignore
      yref: `${t.data.yaxis} domain`,
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 1,
      line: {
        color: 'rgb(238, 238, 238)',
        width: 2,
      },
      opacity: 1,
      row: 2,
      col: 2,
    });

    layout.shapes.push({
      type: 'line',
      // @ts-ignore
      xref: `${t.data.xaxis} domain`,
      // @ts-ignore
      yref: `${t.data.yaxis} domain`,
      x0: 1,
      y0: 0,
      x1: 1,
      y1: 1,
      line: {
        color: 'rgb(238, 238, 238)',
        width: 2,
      },
      opacity: 1,
      row: 2,
      col: 2,
    });
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
