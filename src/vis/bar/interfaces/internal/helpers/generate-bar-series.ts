import { BarSeriesOption } from 'echarts/charts';
import { ColumnInfo, EAggregateTypes } from '../../../../interfaces';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { AggregatedDataType } from '../types';
import { getDataForAggregationType } from './get-data-for-aggregate-type';

export function generateBarSeries(
  aggregatedData: AggregatedDataType,
  config: { aggregateType: EAggregateTypes; display: EBarDisplayType; facets: ColumnInfo | null; group: ColumnInfo | null; groupType: EBarGroupingType },
) {
  return (aggregatedData?.groupingsList ?? [])
    .map((g) =>
      (['selected', 'unselected'] as const).map((s) => {
        const data = getDataForAggregationType(
          aggregatedData,
          {
            aggregateType: config?.aggregateType as EAggregateTypes,
            display: config?.display as EBarDisplayType,
            group: config?.group as ColumnInfo,
            groupType: config?.groupType as EBarGroupingType,
          },
          g,
          s,
        );

        if (!data) {
          return null;
        }
        // avoid rendering empty series (bars for a group with all 0 values)
        if (data.every((d) => Number.isNaN(Number(d.value)) || [Infinity, -Infinity, 0].includes(d.value as number))) {
          return null;
        }

        return {
          name: aggregatedData?.groupingsList.length > 1 ? g : null,
          label: {
            show: config?.group?.id === config?.facets?.id ? true : !(config?.group && config?.groupType === EBarGroupingType.STACK),
          },
          emphasis: {
            label: {
              show: true,
            },
          },
          data: data.map((d) => (d.value === 0 ? null : d.value)) as number[],
          categories: data.map((d) => d.category),
          group: g,
          selected: s,

          // group = individual group names, stack = any fixed name
          stack: config?.groupType === EBarGroupingType.STACK ? 'total' : g,
        };
      }),
    )
    .flat()
    .filter(Boolean) as (BarSeriesOption & { categories: string[]; group: string; selected: 'selected' | 'unselected' })[];
}
