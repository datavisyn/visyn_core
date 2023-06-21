import * as React from 'react';
import { BaseConfig, ESupportedPlotlyVis, ICommonVisProps } from '../interfaces';
import { ScatterVis } from '../scatter/ScatterVis';
import { BarVis } from '../bar';
import { HexbinVis } from '../hexbin/HexbinVis';
import { SankeyVis } from '../sankey/SankeyVis';
import { ViolinVis } from '../violin';
import { BarVisSidebar } from '../bar/BarVisSidebar';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { HexbinVisSidebar } from '../hexbin/HexbinVisSidebar';
import { SankeyVisSidebar } from '../sankey/SankeyVisSidebar';
import { ViolinVisSidebar } from '../violin/ViolinVisSidebar';

interface GeneralVis<T = unknown> {
  type: T;
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element;
  sidebarRenderer: (props) => React.JSX.Element;
}

export function createVis<N extends string, T extends BaseConfig<N>>(
  type: string,
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element,
  sidebarRenderer: (props) => React.JSX.Element,
) {
  const vis = {
    type,
    renderer,
    sidebarRenderer,
  };
  return vis;
}

const visMap: { [key: string]: GeneralVis } = {};
visMap[ESupportedPlotlyVis.BAR] = createVis(ESupportedPlotlyVis.BAR, BarVis, BarVisSidebar);
visMap[ESupportedPlotlyVis.SCATTER] = createVis(ESupportedPlotlyVis.SCATTER, ScatterVis, ScatterVisSidebar);
visMap[ESupportedPlotlyVis.HEXBIN] = createVis(ESupportedPlotlyVis.HEXBIN, HexbinVis, HexbinVisSidebar);
visMap[ESupportedPlotlyVis.SANKEY] = createVis(ESupportedPlotlyVis.SANKEY, SankeyVis, SankeyVisSidebar);
visMap[ESupportedPlotlyVis.VIOLIN] = createVis(ESupportedPlotlyVis.VIOLIN, ViolinVis, ViolinVisSidebar);

export function getVisByConfig<T extends string>(config: BaseConfig<T>) {
  return visMap[config.type];
}
