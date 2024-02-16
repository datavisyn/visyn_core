import { Group, Stack } from '@mantine/core';
import { useResizeObserver, useUncontrolled } from '@mantine/hooks';
import * as d3v7 from 'd3v7';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useSyncedRef } from '../hooks/useSyncedRef';
import { getCssValue } from '../utils';
import { createVis, useVisProvider } from './Provider';
import { VisSidebarWrapper } from './VisSidebarWrapper';
import {
  BaseVisConfig,
  EAggregateTypes,
  EColumnTypes,
  EFilterOptions,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  Scales,
  VisColumn,
} from './interfaces';

import { VisSidebar } from './VisSidebar';
import { VisSidebarOpenButton } from './VisSidebarOpenButton';
import { BarVis } from './bar/BarVis';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './bar/interfaces';
import { barMergeDefaultConfig } from './bar/utils';
import { correlationMergeDefaultConfig } from './correlation';
import { CorrelationVis } from './correlation/CorrelationVis';
import { CorrelationVisSidebar } from './correlation/CorrelationVisSidebar';
import { ICorrelationConfig } from './correlation/interfaces';
import { HeatmapVis } from './heatmap/HeatmapVis';
import { HeatmapVisSidebar } from './heatmap/HeatmapVisSidebar';
import { IHeatmapConfig } from './heatmap/interfaces';
import { heatmapMergeDefaultConfig } from './heatmap/utils';
import { HexbinVis } from './hexbin/HexbinVis';
import { HexbinVisSidebar } from './hexbin/HexbinVisSidebar';
import { IHexbinConfig } from './hexbin/interfaces';
import { hexinbMergeDefaultConfig } from './hexbin/utils';
import { RaincloudVis } from './raincloud/RaincloudVis';
import { RaincloudVisSidebar } from './raincloud/RaincloudVisSidebar';
import { IRaincloudConfig } from './raincloud/interfaces';
import { raincloudMergeDefaultConfig } from './raincloud/utils';
import { SankeyVis } from './sankey/SankeyVis';
import { SankeyVisSidebar } from './sankey/SankeyVisSidebar';
import { ISankeyConfig } from './sankey/interfaces';
import { sankeyMergeDefaultConfig } from './sankey/utils';
import { scatterMergeDefaultConfig } from './scatter';
import { ScatterVis } from './scatter/ScatterVis';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { IScatterConfig } from './scatter/interfaces';
import { ViolinVis, violinMergeDefaultConfig } from './violin';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { IViolinConfig } from './violin/interfaces';

const DEFAULT_SHAPES = ['circle', 'square', 'triangle-up', 'star'];

function registerAllVis(visTypes?: string[]) {
  return [
    createVis({
      type: ESupportedPlotlyVis.SCATTER,
      renderer: ScatterVis,
      sidebarRenderer: ScatterVisSidebar,
      mergeConfig: scatterMergeDefaultConfig,
      description: 'Visualizes two variables as individual data points in two-dimensional space',
    }),
    createVis({
      type: ESupportedPlotlyVis.BAR,
      renderer: BarVis,
      sidebarRenderer: BarVisSidebar,
      mergeConfig: barMergeDefaultConfig,
      description: 'Visualizes categorical data with rectangular bars',
    }),
    createVis({
      type: ESupportedPlotlyVis.HEXBIN,
      renderer: HexbinVis,
      sidebarRenderer: HexbinVisSidebar,
      mergeConfig: hexinbMergeDefaultConfig,
      description: 'Visualizes 2D data points within hexagons',
    }),
    createVis({
      type: ESupportedPlotlyVis.SANKEY,
      renderer: SankeyVis,
      sidebarRenderer: SankeyVisSidebar,
      mergeConfig: sankeyMergeDefaultConfig,
      description: 'Visualizes the flow of data between different categories',
    }),
    createVis({
      type: ESupportedPlotlyVis.HEATMAP,
      renderer: HeatmapVis,
      sidebarRenderer: HeatmapVisSidebar,
      mergeConfig: heatmapMergeDefaultConfig,
      description: 'Visualizes matrix data using color gradients',
    }),
    createVis({
      type: ESupportedPlotlyVis.VIOLIN,
      renderer: ViolinVis,
      sidebarRenderer: ViolinVisSidebar,
      mergeConfig: violinMergeDefaultConfig,
      description: 'Visualizes numerical data distribution by combining a box plot and a kernel density plot',
    }),
    createVis({
      type: ESupportedPlotlyVis.RAINCLOUD,
      renderer: RaincloudVis,
      sidebarRenderer: RaincloudVisSidebar,
      mergeConfig: raincloudMergeDefaultConfig,
      description: 'Visualizes a combination of boxplot, violin plot, and jitter plot',
    }),
    createVis({
      type: ESupportedPlotlyVis.CORRELATION,
      renderer: CorrelationVis,
      sidebarRenderer: CorrelationVisSidebar,
      mergeConfig: correlationMergeDefaultConfig,
      description: 'Visualizes statistical relationships between pairs of numerical variables',
    }),
  ].filter((v) => !visTypes || visTypes.includes(v.type));
}

export function useRegisterDefaultVis(visTypes?: string[]) {
  const { registerVisType } = useVisProvider();

  React.useEffect(() => {
    registerVisType(...registerAllVis(visTypes));
  }, [registerVisType, visTypes]);
}

export function EagerVis({
  columns,
  selected = [],
  colors = null,
  shapes = DEFAULT_SHAPES,
  selectionCallback = () => null,
  filterCallback,
  setExternalConfig = () => null,
  closeCallback = () => null,
  showCloseButton = false,
  externalConfig = null,
  enableSidebar = true,
  showSidebar: internalShowSidebar,
  showDragModeOptions = true,
  setShowSidebar: internalSetShowSidebar,
  showSidebarDefault = false,
  scrollZoom = true,
  visTypes,
}: {
  /**
   * Required data columns which are displayed.
   */
  columns: VisColumn[];
  /**
   * Optional Prop for identifying which points are selected. Any ids that are in this array will be considered selected.
   */
  selected?: string[];
  /**
   * Optional Prop for changing the colors that are used in color mapping. Defaults to the Datavisyn categorical color scheme
   */
  colors?: string[];
  /**
   * Optional Prop for changing the shapes that are used in shape mapping. Defaults to the circle, square, triangle, star.
   */
  shapes?: string[];
  /**
   * Optional Prop which is called when a selection is made in the scatterplot visualization. Passes in the selected points.
   */
  selectionCallback?: (s: string[]) => void;
  /**
   * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired. This logic will be simplified in the future.
   */
  filterCallback?: (s: EFilterOptions) => void;
  setExternalConfig?: (config: BaseVisConfig) => void;
  closeCallback?: () => void;
  showCloseButton?: boolean;
  externalConfig?:
  | IScatterConfig
  | IBarConfig
  | IHexbinConfig
  | ISankeyConfig
  | IHeatmapConfig
  | IViolinConfig
  | IRaincloudConfig
  | ICorrelationConfig
  | BaseVisConfig;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  showDragModeOptions?: boolean;
  setShowSidebar?(show: boolean): void;
  showSidebarDefault?: boolean;
  scrollZoom?: boolean;
  /**
   * Optional property which enables the user to specify which vis types to show as options in the sidebar. If not specified, all vis types will be used.
   */
  visTypes?: string[];
}) {
  const [showSidebar, setShowSidebar] = useUncontrolled<boolean>({
    value: internalShowSidebar,
    defaultValue: showSidebarDefault,
    finalValue: false,
    onChange: internalSetShowSidebar,
  });

  const [ref, dimensions] = useResizeObserver();

  useRegisterDefaultVis(visTypes);

  const { getVisByType } = useVisProvider();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [_visConfig, _setVisConfig] = useUncontrolled({
    value: externalConfig?.type ? getVisByType(externalConfig?.type)?.mergeConfig(columns, externalConfig) : null,
    defaultValue: externalConfig
      ? null
      : columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
        ? ({
          type: ESupportedPlotlyVis.SCATTER,
          numColumnsSelected: [],
          color: null,
          numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
          shape: null,
          dragMode: EScatterSelectSettings.RECTANGLE,
          alphaSliderVal: 0.5,
        } as BaseVisConfig)
        : ({
          type: ESupportedPlotlyVis.BAR,
          multiples: null,
          group: null,
          direction: EBarDirection.HORIZONTAL,
          display: EBarDisplayType.ABSOLUTE,
          groupType: EBarGroupingType.STACK,
          numColumnsSelected: [],
          catColumnSelected: null,
          aggregateColumn: null,
          aggregateType: EAggregateTypes.COUNT,
        } as BaseVisConfig),
    onChange: setExternalConfig,
  });

  const setVisConfig = (v: BaseVisConfig) => {
    const withDefaults = getVisByType(v.type)?.mergeConfig(columns, v);
    _setVisConfig(withDefaults);
  };

  // Converting the selected list into a map, since searching through the list to find an item is common in the vis components.
  const selectedMap: { [key: string]: boolean } = useMemo(() => {
    const currMap: { [key: string]: boolean } = {};

    selected.forEach((s) => {
      currMap[s] = true;
    });

    return currMap;
  }, [selected]);

  const scales: Scales = useMemo(() => {
    const colorScale = d3v7
      .scaleOrdinal()
      .range(
        colors || [
          getCssValue('visyn-c1'),
          getCssValue('visyn-c2'),
          getCssValue('visyn-c3'),
          getCssValue('visyn-c4'),
          getCssValue('visyn-c5'),
          getCssValue('visyn-c6'),
          getCssValue('visyn-c7'),
          getCssValue('visyn-c8'),
          getCssValue('visyn-c9'),
          getCssValue('visyn-c10'),
        ],
      );

    return {
      color: colorScale,
    };
  }, [colors]);

  const commonProps = {
    showSidebar,
    setShowSidebar,
    enableSidebar,
  };

  const Renderer = getVisByType(_visConfig?.type)?.renderer;

  if (!_visConfig || !Renderer) {
    return null;
  }

  return (
    <Group
      noWrap
      pl={0}
      pr={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        // Disable plotly crosshair cursor
        '.nsewdrag': {
          cursor: 'pointer !important',
        },
      }}
    >
      {enableSidebar && !showSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} /> : null}

      <Stack spacing={0} sx={{ width: '100%', height: '100%', overflow: 'hidden' }} align="stretch" ref={ref}>
        <Renderer
          config={_visConfig}
          dimensions={dimensions}
          optionsConfig={{
            color: {
              enable: true,
            },
          }}
          showDragModeOptions={showDragModeOptions}
          shapes={shapes}
          setConfig={setVisConfig}
          filterCallback={filterCallback}
          selectionCallback={selectionCallback}
          selectedMap={selectedMap}
          selectedList={selected}
          columns={columns}
          scales={scales}
          showSidebar={showSidebar}
          showCloseButton={showCloseButton}
          closeButtonCallback={closeCallback}
          scrollZoom={scrollZoom}
          {...commonProps}
        />
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper config={_visConfig} setConfig={setVisConfig} onClick={() => setShowSidebar(false)}>
          <VisSidebar config={_visConfig} columns={columns} filterCallback={filterCallback} setConfig={setVisConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
