import * as React from 'react';
import { ICommonVisSideBarProps } from './interfaces';
import { getVisByConfig } from './provider/Provider';

export function VisSidebar({
  columns,
  filterCallback = () => null,
  optionsConfig,
  externalConfig = null,
  setExternalConfig = null,
  className,
  style,
}: ICommonVisSideBarProps) {
  if (!externalConfig) {
    return null;
  }

  const Renderer = getVisByConfig(externalConfig)?.sidebarRenderer;

  return Renderer ? (
    <Renderer
      config={externalConfig}
      optionsConfig={optionsConfig}
      setConfig={setExternalConfig}
      filterCallback={filterCallback}
      columns={columns}
      className={className}
      style={style}
    />
  ) : null;
}
