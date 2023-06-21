import * as React from 'react';
import { BaseConfig, ESupportedPlotlyVis, ICommonVisProps, ICommonVisSideBarProps, IVisConfig, VisColumn } from '../interfaces';
import { ScatterVis } from '../scatter/ScatterVis';
import { BarVis, barMergeDefaultConfig } from '../bar';
import { HexbinVis } from '../hexbin/HexbinVis';
import { SankeyVis } from '../sankey/SankeyVis';
import { ViolinVis, violinMergeDefaultConfig } from '../violin';
import { BarVisSidebar } from '../bar/BarVisSidebar';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { HexbinVisSidebar } from '../hexbin/HexbinVisSidebar';
import { SankeyVisSidebar } from '../sankey/SankeyVisSidebar';
import { ViolinVisSidebar } from '../violin/ViolinVisSidebar';
import { scatterMergeDefaultConfig } from '../scatter';
import { hexinbMergeDefaultConfig } from '../hexbin/utils';

export function createVis<N extends string, T extends BaseConfig<N>>(
  type: string,
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element,
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element,
  mergeConfig?: (columns: VisColumn[], config: T) => IVisConfig,
) {
  const vis = {
    type,
    renderer,
    sidebarRenderer,
    mergeConfig,
  };
  return vis;
}

interface GeneralVis<T extends string> {
  type: string;
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element;
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element;
  mergeConfig?: (columns: VisColumn[], config: T) => IVisConfig;
}

const visMap: { [key: string]: any } = {};
visMap[ESupportedPlotlyVis.BAR] = createVis(ESupportedPlotlyVis.BAR, BarVis, BarVisSidebar, barMergeDefaultConfig);
visMap[ESupportedPlotlyVis.SCATTER] = createVis(ESupportedPlotlyVis.SCATTER, ScatterVis, ScatterVisSidebar, scatterMergeDefaultConfig);
visMap[ESupportedPlotlyVis.HEXBIN] = createVis(ESupportedPlotlyVis.HEXBIN, HexbinVis, HexbinVisSidebar, hexinbMergeDefaultConfig);
visMap[ESupportedPlotlyVis.SANKEY] = createVis(ESupportedPlotlyVis.SANKEY, SankeyVis, SankeyVisSidebar);
visMap[ESupportedPlotlyVis.VIOLIN] = createVis(ESupportedPlotlyVis.VIOLIN, ViolinVis, ViolinVisSidebar, violinMergeDefaultConfig);

export function getVisByConfig<T extends string>(config: BaseConfig<T>) {
  return visMap[config.type];
}
