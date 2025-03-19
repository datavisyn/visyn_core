import { ESupportedPlotlyVis } from './interfaces';
import barchartGray from '../assets/visualization_icons/barchart_gray_1.svg';
import boxPlotGray from '../assets/visualization_icons/boxplot_gray_1.svg';
import boxPlotWhite from '../assets/visualization_icons/boxplot_white.svg';
import correlationplotGray from '../assets/visualization_icons/correlationplot_gray_1.svg';
import heatmapGray from '../assets/visualization_icons/heatmap_gray_1.svg';
import hexbinplotGray from '../assets/visualization_icons/hexbinplot_gray_1.svg';
import sankeyGray from '../assets/visualization_icons/sankey_gray_1.svg';
import scatterplotGray from '../assets/visualization_icons/scatterplot_gray_1.svg';
import scatterplotWhite from '../assets/visualization_icons/scatterplot_white.svg';
import violinplotGray from '../assets/visualization_icons/violinplot_gray_1.svg';

const imageMap: Record<ESupportedPlotlyVis, { white: string; gray: string }> = {
  [ESupportedPlotlyVis.BOXPLOT]: {
    white: boxPlotWhite,
    gray: boxPlotGray,
  },
  [ESupportedPlotlyVis.SCATTER]: {
    white: scatterplotWhite,
    gray: scatterplotGray,
  },
  [ESupportedPlotlyVis.VIOLIN]: {
    white: '',
    gray: violinplotGray,
  },
  [ESupportedPlotlyVis.BAR]: {
    white: '',
    gray: barchartGray,
  },
  [ESupportedPlotlyVis.HEXBIN]: {
    white: '',
    gray: hexbinplotGray,
  },
  [ESupportedPlotlyVis.HEATMAP]: {
    white: '',
    gray: heatmapGray,
  },
  [ESupportedPlotlyVis.SANKEY]: {
    white: '',
    gray: sankeyGray,
  },
  [ESupportedPlotlyVis.CORRELATION]: {
    white: '',
    gray: correlationplotGray,
  },
};

export function VisTypeChooserImage({ chartName, color }: { chartName: string; color: 'white' | 'gray' }) {
  return imageMap[chartName as keyof typeof imageMap]?.[color] || null;
}
