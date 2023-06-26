import { SankeyVis } from '../sankey/SankeyVis';
import { ViolinVis, violinMergeDefaultConfig } from '../violin';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { HexbinVisSidebar } from '../hexbin/HexbinVisSidebar';
import { SankeyVisSidebar } from '../sankey/SankeyVisSidebar';
import { ViolinVisSidebar } from '../violin/ViolinVisSidebar';
import { ScatterVis, scatterMergeDefaultConfig } from '../scatter';
import { hexinbMergeDefaultConfig } from '../hexbin/utils';
import { BarVis } from '../bar/BarVis';
import { barMergeDefaultConfig } from '../bar/utils';
import { BarVisSidebar } from '../bar/BarVisSidebar';
import { HexbinVis } from '../hexbin/HexbinVis';
import { ESupportedPlotlyVis } from '../interfaces';
import { createVis, visMap } from './Provider';
import { HeatmapVis } from '../heatmap/HeatmapVis';
import { HeatmapVisSidebar } from '../heatmap/HeatmapVisSidebar';
import { heatmapMergeDefaultConfig } from '../heatmap/utils';

export function registerAllVis() {
  visMap[ESupportedPlotlyVis.SCATTER] = createVis(ESupportedPlotlyVis.SCATTER, ScatterVis, ScatterVisSidebar, scatterMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.BAR] = createVis(ESupportedPlotlyVis.BAR, BarVis, BarVisSidebar, barMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.VIOLIN] = createVis(ESupportedPlotlyVis.VIOLIN, ViolinVis, ViolinVisSidebar, violinMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.HEXBIN] = createVis(ESupportedPlotlyVis.HEXBIN, HexbinVis, HexbinVisSidebar, hexinbMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.HEATMAP] = createVis(ESupportedPlotlyVis.HEATMAP, HeatmapVis, HeatmapVisSidebar, heatmapMergeDefaultConfig);

  // visMap[ESupportedPlotlyVis.SANKEY] = createVis(ESupportedPlotlyVis.SANKEY, SankeyVis, SankeyVisSidebar);
}
