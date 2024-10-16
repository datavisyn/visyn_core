import groupBy from 'lodash/groupBy';
import round from 'lodash/round';
import sort from 'lodash/sortBy';
import sortedUniq from 'lodash/sortedUniq';
import { NAN_REPLACEMENT } from '../../../../general';
import { EAggregateTypes, ICommonVisProps } from '../../../../interfaces';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { IBarConfig, IBarDataTableRow } from '../../interfaces';
import { DEFAULT_FACET_NAME } from '../constants';
import { AggregatedDataType } from '../types';
import { median } from './median';

export function generateAggregatedDataLookup(
  config: { isFaceted: boolean; isGrouped: boolean; groupType: EBarGroupingType; display: EBarDisplayType; aggregateType: EAggregateTypes },
  dataTable: IBarDataTableRow[],
  selectedMap: ICommonVisProps<IBarConfig>['selectedMap'],
) {
  const facetGrouped = config.isFaceted ? groupBy(dataTable, 'facet') : { [DEFAULT_FACET_NAME]: dataTable };
  const aggregated: { facets: { [facet: string]: AggregatedDataType }; globalDomain: { min: number; max: number }; facetsList: string[] } = {
    facets: {},
    globalDomain: { min: Infinity, max: -Infinity },
    facetsList: Object.keys(facetGrouped),
  };
  const minMax: { facets: { [facet: string]: AggregatedDataType } } = { facets: {} };

  Object.keys(facetGrouped).forEach((facet) => {
    const values = facetGrouped[facet];
    const facetSensitiveDataTable = facet === DEFAULT_FACET_NAME ? dataTable : dataTable.filter((item) => item.facet === facet);
    const categoriesList = sortedUniq(sort(facetSensitiveDataTable.map((item) => item.category) ?? []));
    const groupingsList = sortedUniq(sort(facetSensitiveDataTable.map((item) => item.group ?? NAN_REPLACEMENT) ?? []));
    (values ?? []).forEach((item) => {
      const { category = NAN_REPLACEMENT, agg, group = NAN_REPLACEMENT } = item;
      const selected = selectedMap?.[item.id] || false;
      if (!aggregated.facets[facet]) {
        aggregated.facets[facet] = { categoriesList, groupingsList, categories: {} };
      }
      if (!aggregated.facets[facet].categories[category]) {
        aggregated.facets[facet].categories[category] = { total: 0, ids: [], groups: {} };
      }
      if (!aggregated.facets[facet].categories[category].groups[group]) {
        aggregated.facets[facet].categories[category].groups[group] = {
          total: 0,
          ids: [],
          selected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
          unselected: { count: 0, sum: 0, min: Infinity, max: -Infinity, nums: [], ids: [] },
        };
      }

      // update category values
      aggregated.facets[facet].categories[category].total++;
      aggregated.facets[facet].categories[category].ids.push(item.id);
      aggregated.facets[facet].categories[category].groups[group].total++;
      aggregated.facets[facet].categories[category].groups[group].ids.push(item.id);

      // update group values
      if (selected) {
        aggregated.facets[facet].categories[category].groups[group].selected.count++;
        aggregated.facets[facet].categories[category].groups[group].selected.sum += agg || 0;
        aggregated.facets[facet].categories[category].groups[group].selected.nums.push(agg || 0);
        aggregated.facets[facet].categories[category].groups[group].selected.ids.push(item.id);
      } else {
        aggregated.facets[facet].categories[category].groups[group].unselected.count++;
        aggregated.facets[facet].categories[category].groups[group].unselected.sum += agg || 0;
        aggregated.facets[facet].categories[category].groups[group].unselected.nums.push(agg || 0);
        aggregated.facets[facet].categories[category].groups[group].unselected.ids.push(item.id);
      }

      if (!minMax.facets[facet]) {
        minMax.facets[facet] = { categoriesList: [], groupingsList: [], categories: {} };
      }
      if (!minMax.facets[facet].categories[category]) {
        minMax.facets[facet].categories[category] = { total: 0, ids: [], groups: {} };
      }
      if (!minMax.facets[facet].categories[category].groups[group]) {
        minMax.facets[facet].categories[category].groups[group] = {
          total: 0,
          ids: [],
          selected: { count: 0, sum: 0, nums: [], ids: [], min: Infinity, max: -Infinity },
          unselected: { count: 0, sum: 0, nums: [], ids: [], min: Infinity, max: -Infinity },
        };
      }

      if (selected) {
        minMax.facets[facet].categories[category].groups[group].selected.min = Math.min(
          minMax.facets[facet].categories[category].groups[group].selected.min,
          agg || Infinity,
        );
        minMax.facets[facet].categories[category].groups[group].selected.max = Math.max(
          minMax.facets[facet].categories[category].groups[group].selected.max,
          agg || -Infinity,
        );
      } else {
        minMax.facets[facet].categories[category].groups[group].unselected.min = Math.min(
          minMax.facets[facet].categories[category].groups[group].unselected.min,
          agg || Infinity,
        );
        minMax.facets[facet].categories[category].groups[group].unselected.max = Math.max(
          minMax.facets[facet].categories[category].groups[group].unselected.max,
          agg || -Infinity,
        );
      }
    });
    (values ?? []).forEach((item) => {
      const { category, group } = item;
      if (aggregated.facets[facet]?.categories[category]?.groups[group] && minMax.facets[facet]?.categories[category]?.groups[group]) {
        aggregated.facets[facet].categories[category].groups[group].selected.min = minMax.facets[facet].categories[category].groups[group].selected.min;
        aggregated.facets[facet].categories[category].groups[group].selected.max = minMax.facets[facet].categories[category].groups[group].selected.max;
        aggregated.facets[facet].categories[category].groups[group].unselected.min = minMax.facets[facet].categories[category].groups[group].unselected.min;
        aggregated.facets[facet].categories[category].groups[group].unselected.max = minMax.facets[facet].categories[category].groups[group].unselected.max;
      }
    });
  });

  Object.values(aggregated.facets).forEach((facet) => {
    Object.values(facet?.categories ?? {}).forEach((category) => {
      Object.values(category?.groups ?? {}).forEach((group) => {
        if (config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED) {
          aggregated.globalDomain.min = 0;
          aggregated.globalDomain.max = 100;
        } else {
          switch (config.aggregateType) {
            case EAggregateTypes.COUNT: {
              const max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(category?.total ?? -Infinity, aggregated.globalDomain.max)
                  : Math.max(group?.total ?? -Infinity, aggregated.globalDomain.max);
              const min =
                config.groupType === EBarGroupingType.STACK
                  ? Math.min(category?.total ?? Infinity, aggregated.globalDomain.min, 0)
                  : Math.min(group?.total ?? Infinity, aggregated.globalDomain.min, 0);
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.AVG: {
              const max = round(
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Math.max(
                        Object.values(category?.groups ?? {}).reduce(
                          (acc, g) => Math.max(acc + (g?.selected.sum ?? -Infinity) / (g?.selected.count || 1), acc),
                          0,
                        ),
                        Object.values(category?.groups ?? {}).reduce(
                          (acc, g) => Math.max(acc + (g?.unselected.sum ?? -Infinity) / (g?.unselected.count || 1), acc),
                          0,
                        ),
                      ),
                      aggregated.globalDomain.max,
                    )
                  : Math.max(
                      Math.max(
                        (group?.selected.sum ?? -Infinity) / (group?.selected.count || 1),
                        (group?.unselected.sum ?? -Infinity) / (group?.unselected.count || 1),
                      ),
                      aggregated.globalDomain.max,
                    ),
                4,
              );
              const min = round(
                config.groupType === EBarGroupingType.STACK
                  ? Math.min(
                      Math.min(
                        Object.values(category?.groups ?? {}).reduce(
                          (acc, g) => Math.min(acc + (g?.selected.sum ?? -Infinity) / (g?.selected.count || 1), acc),
                          0,
                        ),
                        Object.values(category?.groups ?? {}).reduce(
                          (acc, g) => Math.min(acc + (g?.unselected.sum ?? -Infinity) / (g?.unselected.count || 1), acc),
                          0,
                        ),
                      ),
                      aggregated.globalDomain.min,
                    )
                  : Math.min(
                      Math.min(
                        (group?.selected.sum ?? Infinity) / (group?.selected.count || 1),
                        (group?.unselected.sum ?? Infinity) / (group?.unselected.count || 1),
                      ),
                      aggregated.globalDomain.min,
                      0,
                    ),
                4,
              );
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.MIN: {
              const max = round(
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.values(category?.groups ?? {}).reduce((acc, g) => {
                        const selectedMin = g?.selected.min ?? 0;
                        const infiniteSafeSelectedMin = selectedMin === Infinity ? 0 : selectedMin;
                        const unselectedMin = g?.unselected.min ?? 0;
                        const infiniteSafeUnselectedMin = unselectedMin === Infinity ? 0 : unselectedMin;
                        return Math.max(acc + infiniteSafeSelectedMin + infiniteSafeUnselectedMin, acc);
                      }, 0),

                      aggregated.globalDomain.max,
                    )
                  : Math.max(Math.min(group?.selected.min ?? Infinity, group?.unselected.min ?? Infinity), aggregated.globalDomain.max),
                4,
              );
              const min = round(
                config.groupType === EBarGroupingType.STACK
                  ? Math.min(
                      Object.values(category?.groups ?? {}).reduce((acc, g) => {
                        const selectedMin = g?.selected.min ?? 0;
                        const infiniteSafeSelectedMin = selectedMin === Infinity ? 0 : selectedMin;
                        const unselectedMin = g?.unselected.min ?? 0;
                        const infiniteSafeUnselectedMin = unselectedMin === Infinity ? 0 : unselectedMin;
                        return Math.min(acc + infiniteSafeSelectedMin + infiniteSafeUnselectedMin, acc);
                      }, 0),

                      aggregated.globalDomain.min,
                    )
                  : Math.min(Math.min(group?.selected.min ?? Infinity, group?.unselected.min ?? Infinity), aggregated.globalDomain.min, 0),
                4,
              );
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.MAX: {
              const max = round(
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.values(category?.groups ?? {}).reduce((acc, g) => {
                        const selectedMax = g?.selected.max ?? 0;
                        const infiniteSafeSelectedMax = selectedMax === -Infinity ? 0 : selectedMax;
                        const unselectedMax = g?.unselected.max ?? 0;
                        const infiniteSafeUnselectedMax = unselectedMax === -Infinity ? 0 : unselectedMax;
                        return Math.max(acc + infiniteSafeSelectedMax + infiniteSafeUnselectedMax, acc);
                      }, 0),
                      aggregated.globalDomain.max,
                    )
                  : Math.max(Math.max(group?.selected.max ?? -Infinity, group?.unselected.max ?? -Infinity), aggregated.globalDomain.max),
                4,
              );
              const min = round(
                config.groupType === EBarGroupingType.STACK
                  ? Math.min(
                      Object.values(category?.groups ?? {}).reduce((acc, g) => {
                        const selectedMax = g?.selected.max ?? 0;
                        const infiniteSafeSelectedMax = selectedMax === -Infinity ? 0 : selectedMax;
                        const unselectedMax = g?.unselected.max ?? 0;
                        const infiniteSafeUnselectedMax = unselectedMax === -Infinity ? 0 : unselectedMax;
                        return Math.min(acc + infiniteSafeSelectedMax + infiniteSafeUnselectedMax, acc);
                      }, 0),
                      aggregated.globalDomain.min,
                    )
                  : Math.min(Math.max(group?.selected.max ?? -Infinity, group?.unselected.max ?? -Infinity), aggregated.globalDomain.min, 0),
                4,
              );
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.MED: {
              const selectedMedian = median(group?.selected.nums ?? []) ?? 0;
              const unselectedMedian = median(group?.unselected.nums ?? []) ?? 0;
              if (config.isGrouped) {
                if (config.groupType === EBarGroupingType.STACK) {
                  const { max, min } = Object.values(category?.groups ?? {}).reduce(
                    (acc, g) => {
                      const selectedStackMedian = median(g?.selected.nums ?? []) ?? 0;
                      const unselectedStackMedian = median(g?.unselected.nums ?? []) ?? 0;
                      return {
                        ...acc,
                        max: Math.max(acc.max + selectedStackMedian + unselectedStackMedian, acc.max),
                        min: Math.min(acc.min + selectedStackMedian + unselectedStackMedian, acc.min),
                      };
                    },
                    { max: 0, min: 0 },
                  );
                  aggregated.globalDomain.max = Math.max(round(max, 4), aggregated.globalDomain.max, 0);
                  aggregated.globalDomain.min = Math.min(round(min, 4), aggregated.globalDomain.min, 0);
                  break;
                } else if (config.groupType === EBarGroupingType.GROUP) {
                  const max = round(Math.max(Math.max(selectedMedian, unselectedMedian), aggregated.globalDomain.max), 4);
                  const min = round(Math.min(Math.min(selectedMedian, unselectedMedian), aggregated.globalDomain.min, 0), 4);
                  aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
                  aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
                  break;
                }
              } else {
                const max = round(Math.max(Math.max(selectedMedian, unselectedMedian), aggregated.globalDomain.max), 4);
                const min = round(Math.min(Math.min(selectedMedian, unselectedMedian), aggregated.globalDomain.min), 4);
                aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
                aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
                break;
              }
              break;
            }

            default:
              console.warn(`Aggregation type ${config.aggregateType} is not supported by bar chart.`);
              break;
          }
        }
      });
    });
  });

  return aggregated;
}
