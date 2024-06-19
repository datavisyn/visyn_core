import { selectionColorDark } from '../../utils/colors';

/**
 * Default color for items
 */
export const DEFAULT_COLOR = '#2e2e2e';

/**
 * Color for selected items
 */
export const SELECT_COLOR = selectionColorDark;

/**
 * Category name for unknown or missing values
 */
export const NAN_REPLACEMENT = 'Unknown';

/**
 * Color for labels and axis
 */
export const VIS_LABEL_COLOR = '#99A1A9';

/**
 * Color for axis lines
 */
export const VIS_GRID_COLOR = '#E9ECEF';

/**
 * Neutral color (e.g., histogram in scatterplot matrix)
 */
export const VIS_NEUTRAL_COLOR = '#71787E';

/**
 * Trace color (e.g., Dot labels in scatter plot)
 */
export const VIS_TRACES_COLOR = '#7f7f7f';

/**
 * Color for unselected items. It is the VIS_NEUTRAL_COLOR but with 0.3 opacity.
 */
export const VIS_UNSELECTED_COLOR = `${VIS_NEUTRAL_COLOR}4D`;

/**
 * Opacity for unselected items
 */
export const VIS_UNSELECTED_OPACITY = 0.3;

/**
 * Font size for axis labels
 */
export const VIS_AXIS_LABEL_SIZE = '14';

/**
 * Font size for tick labels
 */
export const VIS_TICK_LABEL_SIZE = '12';

/**
 * Font size for axis labels (small)
 */
export const VIS_AXIS_LABEL_SIZE_SMALL = '12';

/**
 * Font size for tick labels (small)
 */
export const VIS_TICK_LABEL_SIZE_SMALL = '10';
