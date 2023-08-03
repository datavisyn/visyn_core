import { BarVisSidebar } from '../bar/BarVisSidebar';
import { barMergeDefaultConfig } from '../bar/utils';
import { BarVis } from '../barGood/BarVis';
import { HexbinVis } from '../hexbin/HexbinVis';
import { HexbinVisSidebar } from '../hexbin/HexbinVisSidebar';
import { hexinbMergeDefaultConfig } from '../hexbin/utils';
import { ESupportedPlotlyVis } from '../interfaces';
import { SankeyVis } from '../sankey/SankeyVis';
import { SankeyVisSidebar } from '../sankey/SankeyVisSidebar';
import { sankeyMergeDefaultConfig } from '../sankey/utils';
import { ScatterVis, scatterMergeDefaultConfig } from '../scatter';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { ViolinVis, violinMergeDefaultConfig } from '../violin';
import { ViolinVisSidebar } from '../violin/ViolinVisSidebar';
import { registerVis } from './Provider';

export function registerAllVis() {
  registerVis(ESupportedPlotlyVis.SCATTER, ScatterVis, ScatterVisSidebar, scatterMergeDefaultConfig);
  registerVis(ESupportedPlotlyVis.BAR, BarVis, BarVisSidebar, barMergeDefaultConfig);
  registerVis(ESupportedPlotlyVis.VIOLIN, ViolinVis, ViolinVisSidebar, violinMergeDefaultConfig);
  registerVis(ESupportedPlotlyVis.HEXBIN, HexbinVis, HexbinVisSidebar, hexinbMergeDefaultConfig);
  registerVis(ESupportedPlotlyVis.SANKEY, SankeyVis, SankeyVisSidebar, sankeyMergeDefaultConfig);
}
