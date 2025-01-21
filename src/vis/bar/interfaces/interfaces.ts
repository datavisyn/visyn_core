import type { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState } from './enums';
import type { BaseVisConfig, ColumnInfo, EAggregateTypes, ESupportedPlotlyVis } from '../../interfaces';

export interface IBarConfig extends BaseVisConfig {
  /**
   * The type of the visualization.
   */
  type: ESupportedPlotlyVis.BAR;
  /**
   * The column based on which the bar plot should be faceted. (split one complex bar chart into multiple bar charts based on the facet column)
   */
  facets: ColumnInfo | null;
  /**
   * When faceted, the index of the facet column to focus on.
   */
  focusFacetIndex?: number | null;
  /**
   * The column based on which the bars should be grouped.
   */
  group: ColumnInfo | null;
  /**
   * The direction of the bars in the plot. (Horizontal or Vertical)
   */
  direction: EBarDirection;
  /**
   * The type of the bar chart display. (Absolute or Normalized / Percentage)
   */
  display: EBarDisplayType;
  /**
   * The type of grouping for the bars in the plot. (Grouped or Stacked)
   */
  groupType: EBarGroupingType;
  /**
   * @deprecated This is not used in bar plot anywhere.
   */
  numColumnsSelected: ColumnInfo[];
  /**
   * The column based on which the bars should be shown.
   */
  catColumnSelected: ColumnInfo | null;
  /**
   * The type of aggregation to be performed on the bars. (Count, Average, Minimum, Maximum, Median and more to come)
   */
  aggregateType: EAggregateTypes;
  /**
   * The column based on which the bars should be aggregated according to the selected aggregate type.
   */
  aggregateColumn: ColumnInfo | null;
  /**
   * Whether to show the facet selector in the header.
   */
  showFocusFacetSelector?: boolean;
  /**
   * The sort state of the bars in the plot.
   * Please note that the sort states `x` and `y` are mutually exclusive.
   */
  sortState?: { x: EBarSortState; y: EBarSortState };
  /**
   * Whether the bar chart should use full height in vertical orientation and no facets.
   */
  useFullHeight?: boolean;
  /**
   * Whether the bar chart should use full width in horizontal orientation.
   */
  useResponsiveBarWidth?: boolean;
  /**
   * Whether to show the column description text in the axis labels.
   */
  showColumnDescriptionText?: boolean;
}

/**
 * Interface for the data table used in the bar chart.
 * @internal
 */
export interface IBarDataTableRow {
  id: string;
  category: string;
  agg: number;
  group: string;
  facet: string;
}
