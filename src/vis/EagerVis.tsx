import * as React from 'react';

import { Group, Overlay, Stack } from '@mantine/core';
import { useResizeObserver, useUncontrolled } from '@mantine/hooks';

import { createVis, useVisProvider } from './Provider';
import { VisSidebar } from './VisSidebar';
import { VisSidebarOpenButton } from './VisSidebarOpenButton';
import { VisSidebarWrapper } from './VisSidebarWrapper';
import { VisTypeChooser } from './VisTypeChooser';
import { BarVis, BarVisSidebar, EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig, barMergeDefaultConfig } from './bar';
import { correlationMergeDefaultConfig } from './correlation';
import { CorrelationVis } from './correlation/CorrelationVis';
import { CorrelationVisSidebar } from './correlation/CorrelationVisSidebar';
import { ICorrelationConfig } from './correlation/interfaces';
import { WarningMessage } from './general/WarningMessage';
import { HeatmapVis } from './heatmap/HeatmapVis';
import { HeatmapVisSidebar } from './heatmap/HeatmapVisSidebar';
import { IHeatmapConfig } from './heatmap/interfaces';
import { heatmapMergeDefaultConfig } from './heatmap/utils';
import { HexbinVis } from './hexbin/HexbinVis';
import { HexbinVisSidebar } from './hexbin/HexbinVisSidebar';
import { IHexbinConfig } from './hexbin/interfaces';
import { hexinbMergeDefaultConfig } from './hexbin/utils';
import {
  BaseVisConfig,
  EAggregateTypes,
  EColumnTypes,
  EFilterOptions,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  IPlotStats,
  VisColumn,
  isESupportedPlotlyVis,
} from './interfaces';
import { SankeyVis } from './sankey/SankeyVis';
import { SankeyVisSidebar } from './sankey/SankeyVisSidebar';
import { ISankeyConfig } from './sankey/interfaces';
import { sankeyMergeDefaultConfig } from './sankey/utils';
import { scatterMergeDefaultConfig } from './scatter';
import { ScatterVis } from './scatter/ScatterVis';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { IScatterConfig } from './scatter/interfaces';
import { ViolinVis, violinBoxMergeDefaultConfig } from './violin';
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
      description: 'Shows the relationship between two numerical variables. Each point is positioned by its values on the horizontal and vertical axes.',
    }),
    createVis({
      type: ESupportedPlotlyVis.BAR,
      renderer: BarVis,
      sidebarRenderer: BarVisSidebar,
      mergeConfig: barMergeDefaultConfig,
      description: 'Compares the values of categories using bars. The length of each bar reflects the magnitude of the corresponding category.',
    }),
    createVis({
      type: ESupportedPlotlyVis.HEXBIN,
      renderer: HexbinVis,
      sidebarRenderer: HexbinVisSidebar,
      mergeConfig: hexinbMergeDefaultConfig,
      description: 'Displays the density of data points in a 2D space using hexagonal bins. Darker hexagons indicate higher data concentration.',
    }),
    createVis({
      type: ESupportedPlotlyVis.SANKEY,
      renderer: SankeyVis,
      sidebarRenderer: SankeyVisSidebar,
      mergeConfig: sankeyMergeDefaultConfig,
      description: `Visualizes flows and connections between categories. The width of the connecting lines represents the flow's magnitude.`,
    }),
    createVis({
      type: ESupportedPlotlyVis.HEATMAP,
      renderer: HeatmapVis,
      sidebarRenderer: HeatmapVisSidebar,
      mergeConfig: heatmapMergeDefaultConfig,
      description: `Represents data as a grid of colored cells, where each cell's color corresponds to a numerical value in a matrix.`,
    }),
    createVis({
      type: ESupportedPlotlyVis.VIOLIN,
      renderer: ViolinVis,
      sidebarRenderer: ViolinVisSidebar,
      mergeConfig: violinBoxMergeDefaultConfig,
      description: `Shows the distribution of data, like a box plot, but also displays the data's density shape, revealing more detail than a standard box plot.`,
    }),
    createVis({
      type: ESupportedPlotlyVis.BOXPLOT,
      renderer: ViolinVis,
      sidebarRenderer: ViolinVisSidebar,
      mergeConfig: violinBoxMergeDefaultConfig,
      description: `Summarizes the distribution of data using quartiles and outliers, providing a quick overview of the data's spread and central tendency.`,
    }),
    createVis({
      type: ESupportedPlotlyVis.CORRELATION,
      renderer: CorrelationVis,
      sidebarRenderer: CorrelationVisSidebar,
      mergeConfig: correlationMergeDefaultConfig,
      description:
        'Shows pairwise correlations between variables. Circle size and color indicate correlation strength (Spearman or Pearson), with p-values for significance.',
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
  stats = undefined,
  statsCallback = () => null,
  colors = undefined,
  shapes = DEFAULT_SHAPES,
  selectionCallback = () => null,
  filterCallback,
  setExternalConfig = undefined,
  closeCallback = () => null,
  showCloseButton = false,
  externalConfig = undefined,
  enableSidebar = true,
  showSidebar: internalShowSidebar,
  showDragModeOptions = true,
  setShowSidebar: internalSetShowSidebar,
  showSidebarDefault = false,
  scrollZoom = true,
  visTypes,
  uniquePlotId,
  showDownloadScreenshot = false,
  showVisTypeChooser: internalShowVisTypeChooser,
  setShowVisTypeChooser: internalSetShowVisTypeChooser,
  enableVisTypeChooser = false,
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
   * Optional Prop for getting statistics for the current plot.
   */
  stats?: IPlotStats;
  /**
   * Optional Prop which is called whenever the statistics for the plot change.
   */
  statsCallback?: (s: IPlotStats | null) => void;
  /**
   * Optional Prop which is called when a filter is applied. Returns a string identifying what type of filter is desired. This logic will be simplified in the future.
   */
  filterCallback?: (s: EFilterOptions) => void;
  setExternalConfig?: (config: BaseVisConfig) => void;
  closeCallback?: () => void;
  showCloseButton?: boolean;
  externalConfig?: IScatterConfig | IBarConfig | IHexbinConfig | ISankeyConfig | IHeatmapConfig | IViolinConfig | ICorrelationConfig | BaseVisConfig;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  showDragModeOptions?: boolean;
  enableVisTypeChooser?: boolean;
  showVisTypeChooser?: boolean;
  setShowVisTypeChooser?: (show: boolean) => void;
  setShowSidebar?(show: boolean): void;
  showSidebarDefault?: boolean;
  scrollZoom?: boolean;
  /**
   * Optional property which enables the user to specify which vis types to show as options in the sidebar. If not specified, all vis types will be used.
   */
  visTypes?: string[];

  /**
   * Unique id for the visualization instance. It is currently used to identify the DOM element and download a screenshot of the plot.
   */
  uniquePlotId?: string;

  /**
   * Optional property to show the download screenshot button in the sidebar.
   */
  showDownloadScreenshot?: boolean;
}) {
  const [selectedList, setSelectedList] = useUncontrolled<string[]>({
    value: selected,
    defaultValue: [],
    onChange: selectionCallback,
  });

  const [showSidebar, setShowSidebar] = useUncontrolled<boolean>({
    value: internalShowSidebar,
    defaultValue: showSidebarDefault,
    finalValue: false,
    onChange: internalSetShowSidebar,
  });

  const [ref, dimensions] = useResizeObserver();

  useRegisterDefaultVis(visTypes);

  const { visTypes: visTypesProvided, getVisByType } = useVisProvider();

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [visConfig, _setVisConfig] = useUncontrolled({
    // Make it controlled if we have an external config
    value: setExternalConfig && externalConfig ? externalConfig : undefined,
    defaultValue:
      // If we have an external value, use that as the default. Otherwise use some inferred config.
      externalConfig || !enableVisTypeChooser
        ? columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
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
              facets: null,
              group: null,
              direction: EBarDirection.HORIZONTAL,
              display: EBarDisplayType.ABSOLUTE,
              groupType: EBarGroupingType.STACK,
              numColumnsSelected: [],
              catColumnSelected: null,
              aggregateColumn: null,
              aggregateType: EAggregateTypes.COUNT,
            } as BaseVisConfig)
        : undefined,
    onChange: setExternalConfig,
  });

  const isSelectedVisTypeRegistered = React.useMemo(() => getVisByType(visConfig?.type), [visConfig?.type, getVisByType]);
  const visTypeNotSupported = React.useMemo(() => !isESupportedPlotlyVis(visConfig?.type), [visConfig]);

  const [prevVisConfig, setPrevVisConfig] = React.useState(visConfig);
  React.useEffect(() => {
    // Merge the config with the default values once or if the vis type changes.
    if (isSelectedVisTypeRegistered && (!visConfig?.merged || prevVisConfig?.type !== visConfig?.type)) {
      // TODO: I would prefer this to be not in a useEffect, as then we wouldn't have the render-flicker: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
      setPrevVisConfig(visConfig);
      _setVisConfig?.(getVisByType(visConfig.type)?.mergeConfig(columns, { ...visConfig, merged: true }) as BaseVisConfig);
    }
  }, [_setVisConfig, columns, getVisByType, isSelectedVisTypeRegistered, prevVisConfig?.type, visConfig]);

  const setVisConfig = React.useCallback(
    (v: BaseVisConfig) => {
      if (v.type !== visConfig?.type) {
        _setVisConfig?.({ ...v, merged: false });
        statsCallback(null);
      } else {
        _setVisConfig?.(v);
      }
    },
    [_setVisConfig, visConfig?.type, statsCallback],
  );

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [showVisTypeChooser, setShowVisTypeChooser] = useUncontrolled<boolean>({
    value: internalShowVisTypeChooser,
    defaultValue: visConfig?.type == null,
    finalValue: false,
    onChange: internalSetShowVisTypeChooser,
  });

  // Converting the selected list into a map, since searching through the list to find an item is common in the vis components.
  const selectedMap: { [key: string]: boolean } = React.useMemo(() => {
    const currMap: { [key: string]: boolean } = {};

    selectedList.forEach((s) => {
      currMap[s] = true;
    });

    return currMap;
  }, [selectedList]);

  const commonProps = {
    showSidebar,
    setShowSidebar,
    enableSidebar,
  };
  const Renderer = getVisByType(visConfig?.type)?.renderer;

  const visHasError = React.useMemo(
    () => !visConfig || !Renderer || !isSelectedVisTypeRegistered || !isESupportedPlotlyVis(visConfig?.type),
    [Renderer, visConfig, isSelectedVisTypeRegistered],
  );

  return (
    <Group
      wrap="nowrap"
      pl={0}
      pr={0}
      style={{
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
      data-testid={`vis-plot-container-${(visConfig?.type ?? '').toLowerCase().replace(/\s/g, '-')}`}
    >
      {enableVisTypeChooser && showVisTypeChooser ? (
        <Overlay bg="white" h="100%">
          <VisTypeChooser
            visTypes={visTypesProvided}
            selectedVisType={isSelectedVisTypeRegistered?.type ?? null}
            onClick={(plotType: string) => {
              setVisConfig({ ...visConfig, type: plotType });
              setShowVisTypeChooser(false);
            }}
          />
        </Overlay>
      ) : null}
      {enableSidebar && !showSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} /> : null}
      <Stack gap={0} style={{ width: '100%', height: '100%', overflow: 'hidden' }} align="stretch" ref={ref}>
        {visTypeNotSupported ? (
          <WarningMessage centered dataTestId="visyn-vis-not-supported" title="Visualization type is not supported" alertProps={{ my: 'auto' }}>
            The visualization type &quot;{visConfig?.type}&quot; is not supported. Please open the sidebar and select a different type.
          </WarningMessage>
        ) : visHasError || !Renderer ? (
          <WarningMessage centered dataTestId="visyn-vis-not-supported" alertProps={{ my: 'auto' }}>
            An error occured in the visualization. Please try to select something different in the sidebar.
          </WarningMessage>
        ) : (
          visConfig?.merged && (
            <Renderer
              config={visConfig}
              dimensions={dimensions}
              optionsConfig={{
                color: {
                  enable: true,
                },
              }}
              uniquePlotId={uniquePlotId}
              showDownloadScreenshot={showDownloadScreenshot}
              showDragModeOptions={showDragModeOptions}
              shapes={shapes}
              setConfig={setVisConfig}
              stats={stats}
              statsCallback={statsCallback}
              filterCallback={filterCallback}
              selectionCallback={setSelectedList}
              selectedMap={selectedMap}
              selectedList={selectedList}
              columns={columns}
              showCloseButton={showCloseButton}
              closeButtonCallback={closeCallback}
              scrollZoom={scrollZoom}
              {...commonProps}
            />
          )
        )}
      </Stack>
      {showSidebar && visConfig?.merged ? (
        <VisSidebarWrapper config={visConfig} setConfig={setVisConfig} onClick={() => setShowSidebar(false)} disableVisTypeSelect={enableVisTypeChooser}>
          <VisSidebar config={visConfig} columns={columns} filterCallback={filterCallback} setConfig={setVisConfig} selectedList={selectedList} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
