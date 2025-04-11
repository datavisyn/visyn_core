import { ESupportedPlotlyVis } from './interfaces';
import barchartGray from '../assets/visualization_icons/barchart_gray.svg';
import boxPlotGray from '../assets/visualization_icons/boxplot_gray.svg';
import correlationplotGray from '../assets/visualization_icons/correlationplot_gray.svg';
import heatmapGray from '../assets/visualization_icons/heatmap_gray.svg';
import hexbinplotGray from '../assets/visualization_icons/hexbinplot_gray.svg';
import sankeyGray from '../assets/visualization_icons/sankey_gray.svg';
import scatterplotGray from '../assets/visualization_icons/scatterplot_gray.svg';
import violinplotGray from '../assets/visualization_icons/violinplot_gray.svg';

const imageMap: Record<ESupportedPlotlyVis, string> = {
  [ESupportedPlotlyVis.BOXPLOT]: boxPlotGray,
  [ESupportedPlotlyVis.SCATTER]: scatterplotGray,
  [ESupportedPlotlyVis.VIOLIN]: violinplotGray,
  [ESupportedPlotlyVis.BAR]: barchartGray,
  [ESupportedPlotlyVis.HEXBIN]: hexbinplotGray,
  [ESupportedPlotlyVis.HEATMAP]: heatmapGray,
  [ESupportedPlotlyVis.SANKEY]: sankeyGray,
  [ESupportedPlotlyVis.CORRELATION]: correlationplotGray,
};

export function VisTypeChooserImage({ chartName }: { chartName: string }) {
  return imageMap[chartName as keyof typeof imageMap] || null;
}
