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
import { ParallelVis } from '../parallelCoordinates/ParallelVis';
import { ParallelVisSidebar } from '../parallelCoordinates/ParallelVisSidebar';
import { parallelCoordinatesMergeDefaultConfig } from '../parallelCoordinates/utils';

export function registerAllVis() {
  visMap[ESupportedPlotlyVis.SCATTER] = createVis(ESupportedPlotlyVis.SCATTER, ScatterVis, ScatterVisSidebar, scatterMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.BAR] = createVis(ESupportedPlotlyVis.BAR, BarVis, BarVisSidebar, barMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.VIOLIN] = createVis(ESupportedPlotlyVis.VIOLIN, ViolinVis, ViolinVisSidebar, violinMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.HEXBIN] = createVis(ESupportedPlotlyVis.HEXBIN, HexbinVis, HexbinVisSidebar, hexinbMergeDefaultConfig);
  visMap[ESupportedPlotlyVis.PARALLEL_COORDINATES] = createVis(
    ESupportedPlotlyVis.PARALLEL_COORDINATES,
    ParallelVis,
    ParallelVisSidebar,
    parallelCoordinatesMergeDefaultConfig,
  );

  // visMap[ESupportedPlotlyVis.SANKEY] = createVis(ESupportedPlotlyVis.SANKEY, SankeyVis, SankeyVisSidebar);
}
