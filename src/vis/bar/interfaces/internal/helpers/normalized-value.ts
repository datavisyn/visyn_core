import round from 'lodash/round';
import { EBarGroupingType, EBarDisplayType } from '../../enums';
import { IBarConfig } from '../../interfaces';

/**
 * Calculates and returns the rounded absolute or normalized value, dependending on the config value.
 * Enabled grouping always returns the absolute value. The normalized value is only calculated for stacked bars.
 * @param config Bar chart configuration
 * @param value Absolute value
 * @param total Number of values in the category
 * @returns Returns the rounded absolute value. Otherwise returns the rounded normalized value.
 */
export function normalizedValue({ config, value, total }: { config: IBarConfig; value: number; total: number }) {
  // NOTE: @dv-usama-ansari: Filter out Infinity and -Infinity values. This is required for proper display of minimum and maximum aggregations.
  if ([Infinity, -Infinity].includes(value)) {
    return null;
  }
  return config?.group && config?.groupType === EBarGroupingType.STACK && config?.display === EBarDisplayType.NORMALIZED
    ? round((value / total) * 100, 2)
    : round(value, 4);
}
