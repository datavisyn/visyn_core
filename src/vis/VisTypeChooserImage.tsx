import { ESupportedPlotlyVis } from './interfaces';
import barchartGray from '../assets/visualization_icons/barchart_gray.svg';
import barchartGrayHighlight from '../assets/visualization_icons/barchart_gray_highlight.svg';
import boxPlotGray from '../assets/visualization_icons/boxplot_gray.svg';
import boxPlotGrayHighlight from '../assets/visualization_icons/boxplot_gray_highlight.svg';
import correlationplotGray from '../assets/visualization_icons/correlationplot_gray.svg';
import correlationplotGrayHighlight from '../assets/visualization_icons/correlationplot_gray_highlight.svg';
import heatmapGray from '../assets/visualization_icons/heatmap_gray.svg';
import heatmapGrayHighlight from '../assets/visualization_icons/heatmap_gray_highlight.svg';
import hexbinplotGray from '../assets/visualization_icons/hexbinplot_gray.svg';
import hexbinplotGrayHighlight from '../assets/visualization_icons/hexbinplot_gray_highlight.svg';
import sankeyGray from '../assets/visualization_icons/sankey_gray.svg';
import sankeyGrayHighlight from '../assets/visualization_icons/sankey_gray_highlight.svg';
import scatterplotGray from '../assets/visualization_icons/scatterplot_gray.svg';
import scatterplotGrayHighlight from '../assets/visualization_icons/scatterplot_gray_highlight.svg';
import violinplotGray from '../assets/visualization_icons/violinplot_gray.svg';
import violinplotGrayHighlight from '../assets/visualization_icons/violinplot_gray_highlight.svg';

const imageMap: Record<ESupportedPlotlyVis, { highlight: string; gray: string }> = {
  [ESupportedPlotlyVis.BOXPLOT]: {
    gray: boxPlotGray,
    highlight: boxPlotGrayHighlight,
  },
  [ESupportedPlotlyVis.SCATTER]: {
    gray: scatterplotGray,
    highlight: scatterplotGrayHighlight,
  },
  [ESupportedPlotlyVis.VIOLIN]: {
    gray: violinplotGray,
    highlight: violinplotGrayHighlight,
  },
  [ESupportedPlotlyVis.BAR]: {
    gray: barchartGray,
    highlight: barchartGrayHighlight,
  },
  [ESupportedPlotlyVis.HEXBIN]: {
    gray: hexbinplotGray,
    highlight: hexbinplotGrayHighlight,
  },
  [ESupportedPlotlyVis.HEATMAP]: {
    gray: heatmapGray,
    highlight: heatmapGrayHighlight,
  },
  [ESupportedPlotlyVis.SANKEY]: {
    gray: sankeyGray,
    highlight: sankeyGrayHighlight,
  },
  [ESupportedPlotlyVis.CORRELATION]: {
    gray: correlationplotGray,
    highlight: correlationplotGrayHighlight,
  },
};

export function VisTypeChooserImage({ chartName, color }: { chartName: string; color: 'highlight' | 'gray' }) {
  return imageMap[chartName as keyof typeof imageMap]?.[color] || null;
}
