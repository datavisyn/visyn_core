import * as React from 'react';
import { ICommonVisSideBarProps } from './interfaces';
import { getVisByConfig } from './provider/Provider';

export function VisSidebar({
  columns,
  filterCallback = () => null,
  optionsConfig,
  config = null,
  setConfig = null,
  className,
  style,
}: ICommonVisSideBarProps<typeof config>) {
  if (!config) {
    return null;
  }

  const Renderer = getVisByConfig(config)?.sidebarRenderer;

  return Renderer ? (
    <Renderer
      config={config}
      optionsConfig={optionsConfig}
      setConfig={setConfig}
      filterCallback={filterCallback}
      columns={columns}
      className={className}
      style={style}
    />
  ) : null;
}
