import { ESupportedPlotlyVis } from './interfaces';
import barchart from '../assets/visualization_icons/barchart.svg';
import boxPlot from '../assets/visualization_icons/boxplot.svg';
import correlationplot from '../assets/visualization_icons/correlationplot.svg';
import heatmap from '../assets/visualization_icons/heatmap.svg';
import hexbinplot from '../assets/visualization_icons/hexbinplot.svg';
import sankey from '../assets/visualization_icons/sankey.svg';
import scatterplot from '../assets/visualization_icons/scatterplot.svg';
import violinplot from '../assets/visualization_icons/violinplot.svg';

const imageMap: Record<ESupportedPlotlyVis, string> = {
  [ESupportedPlotlyVis.BOXPLOT]: boxPlot,
  [ESupportedPlotlyVis.SCATTER]: scatterplot,
  [ESupportedPlotlyVis.VIOLIN]: violinplot,
  [ESupportedPlotlyVis.BAR]: barchart,
  [ESupportedPlotlyVis.HEXBIN]: hexbinplot,
  [ESupportedPlotlyVis.HEATMAP]: heatmap,
  [ESupportedPlotlyVis.SANKEY]: sankey,
  [ESupportedPlotlyVis.CORRELATION]: correlationplot,
};

export function VisTypeChooserImage({ chartName }: { chartName: string }) {
  return imageMap[chartName as keyof typeof imageMap] || null;
}
