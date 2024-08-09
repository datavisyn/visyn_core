import * as React from 'react';
import { useVisProvider } from './Provider';
import { ICommonVisSideBarProps } from './interfaces';

export function VisSidebar({
  columns,
  filterCallback,
  optionsConfig,
  config = null,
  setConfig = null,
  className,
  style,
  selectedPointsCount = 0,
}: ICommonVisSideBarProps<typeof config>) {
  const { getVisByType } = useVisProvider();

  if (!config) {
    return null;
  }

  const Renderer = getVisByType(config?.type)?.sidebarRenderer;

  return Renderer ? (
    <Renderer
      config={config}
      optionsConfig={optionsConfig}
      setConfig={setConfig}
      filterCallback={filterCallback}
      columns={columns}
      className={className}
      style={style}
      selectedPointsCount={selectedPointsCount}
    />
  ) : null;
}
