import { median } from 'd3v7';
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

export function generateAggregatedDataLookup(
  config: { isFaceted: boolean; groupType: EBarGroupingType; display: EBarDisplayType; aggregateType: EAggregateTypes },
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

  Object.keys(aggregated.facets).forEach((facet) => {
    Object.keys(aggregated.facets[facet]?.categories ?? {}).forEach((category) => {
      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).forEach((group) => {
        if (config.groupType === EBarGroupingType.STACK && config.display === EBarDisplayType.NORMALIZED) {
          aggregated.globalDomain.min = 0;
          aggregated.globalDomain.max = 100;
        } else {
          switch (config.aggregateType) {
            case EAggregateTypes.COUNT: {
              const max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(aggregated.facets[facet]?.categories[category]?.total ?? -Infinity, aggregated.globalDomain.max)
                  : Math.max(aggregated.facets[facet]?.categories[category]?.groups[group]?.total ?? -Infinity, aggregated.globalDomain.max);
              const min =
                config.groupType === EBarGroupingType.STACK
                  ? Math.min(aggregated.facets[facet]?.categories[category]?.total ?? Infinity, aggregated.globalDomain.min, 0)
                  : Math.min(aggregated.facets[facet]?.categories[category]?.groups[group]?.total ?? Infinity, aggregated.globalDomain.min, 0);
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.AVG: {
              const max =
                config.groupType === EBarGroupingType.STACK
                  ? round(
                      Math.max(
                        Math.max(
                          Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce(
                            (acc, key) =>
                              acc +
                              (aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.sum ?? -Infinity) /
                                (aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.count || 1),
                            0,
                          ),
                          Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce(
                            (acc, key) =>
                              acc +
                              (aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.sum ?? -Infinity) /
                                (aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.count || 1),
                            0,
                          ),
                        ),
                        aggregated.globalDomain.max,
                      ),
                      4,
                    )
                  : round(
                      Math.max(
                        Math.max(
                          (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.sum ?? -Infinity) /
                            (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.count || 1),
                          (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.sum ?? -Infinity) /
                            (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.count || 1),
                        ),
                        aggregated.globalDomain.max,
                      ),
                      4,
                    );
              const min = round(
                Math.min(
                  Math.min(
                    (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.sum ?? Infinity) /
                      (aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.count || 1),
                    (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.sum ?? Infinity) /
                      (aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.count || 1),
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
              const max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce((acc, key) => {
                        const selectedMin = aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.min ?? 0;
                        const infiniteSafeSelectedMin = selectedMin === Infinity ? 0 : selectedMin;
                        const unselectedMin = aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.min ?? 0;
                        const infiniteSafeUnselectedMin = unselectedMin === Infinity ? 0 : unselectedMin;
                        return acc + infiniteSafeSelectedMin + infiniteSafeUnselectedMin;
                      }, 0),

                      aggregated.globalDomain.max,
                    )
                  : Math.max(
                      Math.min(
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.min ?? Infinity,
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.min ?? Infinity,
                      ),
                      aggregated.globalDomain.max,
                    );
              const min = Math.min(
                Math.min(
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.min ?? Infinity,
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.min ?? Infinity,
                ),
                aggregated.globalDomain.min,
                0,
              );
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.MAX: {
              const max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce((acc, key) => {
                        const selectedMax = aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.max ?? 0;
                        const infiniteSafeSelectedMax = selectedMax === -Infinity ? 0 : selectedMax;
                        const unselectedMax = aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.max ?? 0;
                        const infiniteSafeUnselectedMax = unselectedMax === -Infinity ? 0 : unselectedMax;
                        return acc + infiniteSafeSelectedMax + infiniteSafeUnselectedMax;
                      }, 0),
                      aggregated.globalDomain.max,
                    )
                  : Math.max(
                      Math.max(
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.max ?? -Infinity,
                        aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.max ?? -Infinity,
                      ),
                      aggregated.globalDomain.max,
                    );
              const min = Math.min(
                Math.max(
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.max ?? -Infinity,
                  aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.max ?? -Infinity,
                ),
                aggregated.globalDomain.min,
                0,
              );
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
              break;
            }

            case EAggregateTypes.MED: {
              const selectedMedian = median(aggregated.facets[facet]?.categories[category]?.groups[group]?.selected.nums ?? []);
              const unselectedMedian = median(aggregated.facets[facet]?.categories[category]?.groups[group]?.unselected.nums ?? []);
              const max =
                config.groupType === EBarGroupingType.STACK
                  ? Math.max(
                      Object.keys(aggregated.facets[facet]?.categories[category]?.groups ?? {}).reduce((acc, key) => {
                        const selectedStackMedian = median(aggregated.facets[facet]?.categories[category]?.groups[key]?.selected.nums ?? []) ?? 0;
                        const unselectedStackMedian = median(aggregated.facets[facet]?.categories[category]?.groups[key]?.unselected.nums ?? []) ?? 0;
                        return acc + selectedStackMedian + unselectedStackMedian;
                      }, 0),
                    )
                  : Math.max(Math.max(selectedMedian ?? -Infinity, unselectedMedian ?? -Infinity), aggregated.globalDomain.max);
              const min = Math.min(Math.min(selectedMedian ?? Infinity, unselectedMedian ?? Infinity), aggregated.globalDomain.min, 0);
              aggregated.globalDomain.max = Math.max(max, aggregated.globalDomain.max, 0);
              aggregated.globalDomain.min = Math.min(min, aggregated.globalDomain.min, 0);
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
