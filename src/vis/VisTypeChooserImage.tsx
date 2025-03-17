import { ESupportedPlotlyVis } from './interfaces';
import boxPlotGray from '../assets/visualization_icons/boxplot_gray.svg';
import boxPlotWhite from '../assets/visualization_icons/boxplot_white.svg';
import scatterplotGray from '../assets/visualization_icons/scatterplot_gray.svg';
import scatterplotWhite from '../assets/visualization_icons/scatterplot_white.svg';

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
    gray: '',
  },
  [ESupportedPlotlyVis.BAR]: {
    white: '',
    gray: '',
  },
  [ESupportedPlotlyVis.HEXBIN]: {
    white: '',
    gray: '',
  },
  [ESupportedPlotlyVis.HEATMAP]: {
    white: '',
    gray: '',
  },
  [ESupportedPlotlyVis.SANKEY]: {
    white: '',
    gray: '',
  },
  [ESupportedPlotlyVis.CORRELATION]: {
    white: '',
    gray: '',
  },
};

export function VisTypeChooserImage({ chartName, color }: { chartName: string; color: 'white' | 'gray' }) {
  return imageMap[chartName as keyof typeof imageMap]?.[color] || null;
}
