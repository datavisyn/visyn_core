import * as React from 'react';
import { BaseConfig, ICommonVisProps, ICommonVisSideBarProps, VisColumn } from '../interfaces';

/**
 * Generic utility function for creating a vis object.
 */
export function createVis<T extends BaseConfig>(
  type: string,

  /** The main vis renderer. Required in all visualizations. */
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element,

  /** The sidebar renderer. Required in all visualizations. */
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element,

  mergeConfig: (columns: VisColumn[], config: T) => T,
) {
  return {
    type,
    renderer,
    sidebarRenderer,
    mergeConfig,
  };
}

/**
 * The general visualization interface. Holds the type and the renderers.
 */
interface GeneralVis<T extends BaseConfig> {
  type: string;
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element;
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element;
  mergeConfig: (columns: VisColumn[], config: T) => T;
}

export const visMap: { [key: string]: GeneralVis<BaseConfig> } = {};

export function getVisByConfig<T extends BaseConfig>(config: T) {
  return visMap[config.type] as GeneralVis<T>;
}

export function getAllVisTypes() {
  return Object.values(visMap).map((vis) => vis.type as string);
}

export function registerVis<T extends BaseConfig>(
  type: string,
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element,
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element,
  mergeConfig: (columns: VisColumn[], config: T) => T,
) {
  visMap[type] = createVis(type, renderer, sidebarRenderer, mergeConfig);
}
