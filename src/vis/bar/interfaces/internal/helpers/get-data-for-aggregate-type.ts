import { ColumnInfo, EAggregateTypes } from '../../../../interfaces';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { AggregatedDataType } from '../types';
import { median } from './median';
import { normalizedValue } from './normalized-value';

/**
 * Retrieves data for a specified aggregation type from the aggregated data.
 *
 * @param aggregatedData - The aggregated data object containing categories and their respective groups.
 * @param config - Configuration object containing the aggregation type, display type, group information, and grouping type.
 * @param config.aggregateType - The type of aggregation to be performed (e.g., Count, Average, Minimum, Maximum or Median).
 * @param config.display - The display type for the bar chart (Absolute or Normalized).
 * @param config.group - Information about the group column.
 * @param config.groupType - The type of grouping to be applied (Group or Stack).
 * @param group - The specific group to retrieve data for.
 * @param selected - Indicates whether to retrieve data for 'selected' or 'unselected' items.
 * @returns An array of objects containing the category and its corresponding value based on the specified aggregation type.
 *          Returns `null` if no aggregated data is available.
 * @throws Will log a warning if the aggregation type is not supported or if no data is available.
 */
export function getDataForAggregationType(
  aggregatedData: AggregatedDataType,
  config: { aggregateType: EAggregateTypes; display: EBarDisplayType; group: ColumnInfo | null; groupType: EBarGroupingType },
  group: string,
  selected: 'selected' | 'unselected',
) {
  if (aggregatedData) {
    switch (config.aggregateType) {
      case EAggregateTypes.COUNT:
        return (aggregatedData.categoriesList ?? []).map((category) => ({
          value: aggregatedData.categories[category]?.groups[group]?.[selected]
            ? normalizedValue(config, aggregatedData.categories[category].groups[group][selected].count, aggregatedData.categories[category].total)
            : 0,
          category,
        }));

      case EAggregateTypes.AVG:
        return (aggregatedData.categoriesList ?? []).map((category) => ({
          value: aggregatedData.categories[category]?.groups[group]?.[selected]
            ? normalizedValue(
                config,
                aggregatedData.categories[category].groups[group][selected].sum / (aggregatedData.categories[category].groups[group][selected].count || 1),
                aggregatedData.categories[category].total,
              )
            : 0,
          category,
        }));

      case EAggregateTypes.MIN:
        return (aggregatedData.categoriesList ?? []).map((category) => ({
          value: aggregatedData.categories[category]?.groups[group]?.[selected]
            ? normalizedValue(config, aggregatedData.categories[category].groups[group][selected].min, aggregatedData.categories[category].total)
            : 0,
          category,
        }));

      case EAggregateTypes.MAX:
        return (aggregatedData.categoriesList ?? []).map((category) => ({
          value: aggregatedData.categories[category]?.groups[group]?.[selected]
            ? normalizedValue(config, aggregatedData.categories[category].groups[group][selected].max, aggregatedData.categories[category].total)
            : 0,
          category,
        }));

      case EAggregateTypes.MED:
        return (aggregatedData.categoriesList ?? []).map((category) => ({
          value: aggregatedData.categories[category]?.groups[group]?.[selected]
            ? normalizedValue(
                config,
                median(aggregatedData.categories[category].groups[group][selected].nums) as number,
                aggregatedData.categories[category].total,
              )
            : 0,
          category,
        }));

      default:
        console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
        return [];
    }
  }
  console.warn(`No data available`);
  return null;
}
