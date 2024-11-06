/**
 * Enumerations for grouping type of the bar plot.
 * - `STACK`: Stacked bars.
 * - `GROUP`: Grouped bars.
 */
export enum EBarGroupingType {
  STACK = 'Stacked',
  GROUP = 'Grouped',
}

/**
 * Enumerations for the display type of the bar plot.
 * - `ABSOLUTE`: Absolute values.
 * - `NORMALIZED`: Normalized values or percentage values.
 */
export enum EBarDisplayType {
  ABSOLUTE = 'Absolute',
  NORMALIZED = 'Normalized',
}

/**
 * Enumerations for the direction of the bar plot.
 * - `VERTICAL`: Vertical bars.
 * - `HORIZONTAL`: Horizontal bars.
 */
export enum EBarDirection {
  VERTICAL = 'Vertical',
  HORIZONTAL = 'Horizontal',
}

/**
 * Enumerations for the sort state of the bar plot.
 * - `NONE`: No sorting.
 * - `ASCENDING`: Ascending sorting.
 * - `DESCENDING`: Descending sorting.
 */
export enum EBarSortState {
  NONE = 'None',
  ASCENDING = 'Ascending',
  DESCENDING = 'Descending',
}

/**
 * Enumerations for the sort parameters of the bar plot.
 * - `AGGREGATION`: Sort according to the aggregation axis.
 * - `CATEGORIES`: Sort according to the categorical axis.
 */
export enum EBarSortParameters {
  AGGREGATION = 'Aggregation',
  CATEGORIES = 'Categories',
}
