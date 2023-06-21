import * as React from 'react';
import { BaseConfig, ICommonVisProps, ICommonVisSideBarProps, VisColumn } from '../interfaces';
import { registerAllVis } from './utils';

export function createVis<T extends BaseConfig>(
  type: string,
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element,
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element,
  mergeConfig?: (columns: VisColumn[], config: T) => T,
) {
  const vis = {
    type,
    renderer,
    sidebarRenderer,
    mergeConfig,
  };
  return vis;
}

interface GeneralVis<T extends BaseConfig> {
  type: string;
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element;
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element;
  mergeConfig?: (columns: VisColumn[], config: T) => T;
}

export const visMap: { [key: string]: GeneralVis<BaseConfig> } = {};
registerAllVis();

export function getVisByConfig<T extends BaseConfig>(config: T) {
  return visMap[config.type] as GeneralVis<T>;
}

export function getAllVisTypes() {
  return Object.values(visMap).map((vis) => vis.type as string);
}
