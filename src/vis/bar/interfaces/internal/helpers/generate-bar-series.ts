import { ScaleOrdinal } from 'd3v7';
import { BarSeriesOption } from 'echarts/charts';
import { DEFAULT_COLOR } from 'lineupjs';
import { VIS_UNSELECTED_OPACITY, NAN_REPLACEMENT, SELECT_COLOR, VIS_NEUTRAL_COLOR } from '../../../../general';
import { EAggregateTypes, ColumnInfo } from '../../../../interfaces';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { AggregatedDataType } from '../types';
import { getDataForAggregationType } from './get-data-for-aggregate-type';

export function generateBarSeries(
  aggregatedData: AggregatedDataType,
  baseSeries: BarSeriesOption,
  config: { aggregateType: EAggregateTypes; display: EBarDisplayType; facets: ColumnInfo | null; group: ColumnInfo | null; groupType: EBarGroupingType },
  groupColorScale: ScaleOrdinal<string, string, never>,
  hasSelected: boolean,
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
        const isGrouped = config?.group && groupColorScale != null;
        const isSelected = s === 'selected';
        const shouldLowerOpacity = hasSelected && isGrouped && !isSelected;
        const lowerBarOpacity = shouldLowerOpacity ? { opacity: VIS_UNSELECTED_OPACITY } : {};
        const fixLabelColor = shouldLowerOpacity ? { opacity: 0.5, color: DEFAULT_COLOR } : {};

        return {
          ...baseSeries,
          name: aggregatedData?.groupingsList.length > 1 ? g : null,
          label: {
            ...baseSeries.label,
            ...fixLabelColor,
            show: config?.group?.id === config?.facets?.id ? true : !(config?.group && config?.groupType === EBarGroupingType.STACK),
          },
          emphasis: {
            label: {
              show: true,
            },
          },
          itemStyle: {
            color:
              g === NAN_REPLACEMENT ? (isSelected ? SELECT_COLOR : VIS_NEUTRAL_COLOR) : isGrouped ? groupColorScale(g) || VIS_NEUTRAL_COLOR : VIS_NEUTRAL_COLOR,

            ...lowerBarOpacity,
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
    .filter(Boolean) as (BarSeriesOption & { categories: string[] })[];
}
