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
import { BarVis } from './barGood/BarVis';
import { BarVisSidebar } from './barGood/BarVisSidebar';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, barMergeDefaultConfig } from './barGood/utils';
import { ICorrelationConfig, correlationMergeDefaultConfig } from './correlation';
import { CorrelationVis } from './correlation/CorrelationVis';
import { CorrelationVisSidebar } from './correlation/CorrelationVisSidebar';
import { HeatmapVis } from './heatmap/HeatmapVis';
import { HeatmapVisSidebar } from './heatmap/HeatmapVisSidebar';
import { IHeatmapConfig, heatmapMergeDefaultConfig } from './heatmap/utils';
import { HexbinVis } from './hexbin/HexbinVis';
import { HexbinVisSidebar } from './hexbin/HexbinVisSidebar';
import { IHexbinConfig, hexinbMergeDefaultConfig } from './hexbin/utils';
import { RaincloudVis } from './raincloud/RaincloudVis';
import { RaincloudVisSidebar } from './raincloud/RaincloudVisSidebar';
import { IRaincloudConfig, raincloudMergeDefaultConfig } from './raincloud/utils';
import { SankeyVis } from './sankey/SankeyVis';
import { SankeyVisSidebar } from './sankey/SankeyVisSidebar';
import { ISankeyConfig, sankeyMergeDefaultConfig } from './sankey/utils';
import { IScatterConfig, scatterMergeDefaultConfig } from './scatter';
import { ScatterVis } from './scatter/ScatterVis';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { IViolinConfig, ViolinVis, violinMergeDefaultConfig } from './violin';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';

const DEFAULT_SHAPES = ['circle', 'square', 'triangle-up', 'star'];

function registerAllVis() {
  return [
    createVis(ESupportedPlotlyVis.SCATTER, ScatterVis, ScatterVisSidebar, scatterMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.BAR, BarVis, BarVisSidebar, barMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.HEXBIN, HexbinVis, HexbinVisSidebar, hexinbMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.SANKEY, SankeyVis, SankeyVisSidebar, sankeyMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.HEATMAP, HeatmapVis, HeatmapVisSidebar, heatmapMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.VIOLIN, ViolinVis, ViolinVisSidebar, violinMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.RAINCLOUD, RaincloudVis, RaincloudVisSidebar, raincloudMergeDefaultConfig),
    createVis(ESupportedPlotlyVis.CORRELATION, CorrelationVis, CorrelationVisSidebar, correlationMergeDefaultConfig),
  ];
}

export function useRegisterDefaultVis() {
  const { registerVisType } = useVisProvider();

  React.useEffect(() => {
    registerVisType(...registerAllVis());
  }, [registerVisType]);
}

export function EagerVis({
  columns,
  selected = [],
  colors = null,
  shapes = DEFAULT_SHAPES,
  selectionCallback = () => null,
  filterCallback = () => null,
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
}) {
  const [showSidebar, setShowSidebar] = useUncontrolled<boolean>({
    value: internalShowSidebar,
    defaultValue: showSidebarDefault,
    finalValue: false,
    onChange: internalSetShowSidebar,
  });

  const [ref, dimensions] = useResizeObserver();

  useRegisterDefaultVis();

  const { getVisByType } = useVisProvider();

  // Each time you switch between vis config types, there is one render where the config is inconsistent with the type before the merge functions in the useEffect below can be called.
  // To ensure that we never render an incosistent config, keep a consistent and a current in the config. Always render the consistent.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [{ consistent: visConfig, current: inconsistentVisConfig }, _setVisConfig] = React.useState<{
    consistent: BaseVisConfig;
    current: BaseVisConfig;
  }>(
    externalConfig
      ? { consistent: null, current: externalConfig }
      : columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
      ? {
          consistent: null,
          current: {
            type: ESupportedPlotlyVis.SCATTER,
            numColumnsSelected: [],
            color: null,
            numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
            shape: null,
            dragMode: EScatterSelectSettings.RECTANGLE,
            alphaSliderVal: 0.5,
          } as BaseVisConfig,
        }
      : {
          consistent: null,
          current: {
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
          } as BaseVisConfig,
        },
  );

  const setExternalConfigRef = useSyncedRef(setExternalConfig);
  useEffect(() => {
    setExternalConfigRef.current?.(visConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(visConfig), setExternalConfigRef]);

  const setVisConfig = React.useCallback((newConfig: BaseVisConfig) => {
    _setVisConfig((oldConfig) => {
      return {
        current: newConfig,
        consistent: oldConfig.current.type !== newConfig.type ? oldConfig.consistent : newConfig,
      };
    });
  }, []);

  React.useEffect(() => {
    const vis = getVisByType(inconsistentVisConfig?.type);
    if (vis) {
      const newConfig = vis.mergeConfig(columns, inconsistentVisConfig);
      _setVisConfig({ current: newConfig, consistent: newConfig });
    }

    // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inconsistentVisConfig?.type, getVisByType]);

  useEffect(() => {
    if (externalConfig) {
      setVisConfig(externalConfig);
    }
  }, [externalConfig, setVisConfig]);

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

  if (!visConfig) {
    return <div className="tdp-busy" />;
  }

  const commonProps = {
    showSidebar,
    setShowSidebar,
    enableSidebar,
  };

  const Renderer = getVisByType(visConfig?.type)?.renderer;

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
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <Stack spacing={0} sx={{ width: '100%', height: '100%', overflow: 'hidden' }} align="stretch" ref={ref}>
        {Renderer ? (
          <Renderer
            config={visConfig}
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
        ) : null}
      </Stack>
      {showSidebar ? (
        <VisSidebarWrapper>
          <VisSidebar config={visConfig} columns={columns} filterCallback={filterCallback} setConfig={setVisConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
