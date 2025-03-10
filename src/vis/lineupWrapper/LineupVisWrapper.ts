import * as React from 'react';

import { CategoricalColumn, Column, IDataRow, LocalDataProvider, NumberColumn, Ranking, ValueColumn } from 'lineupjs';
import { createRoot } from 'react-dom/client';

import { IRow } from '../../base/interfaces';
import { i18n } from '../../i18n';
import { Vis } from '../LazyVis';
import { ColumnInfo, EColumnTypes, EFilterOptions, IVisCommonValue, VisColumn } from '../interfaces';

export class LineupVisWrapper {
  /**
   * This string is assigned if a categorical value is missing and rendered by Plotly.
   */
  private PLOTLY_CATEGORICAL_MISSING_VALUE: string;

  readonly node: HTMLElement;

  private viewable: boolean;

  private idField: string;

  constructor(
    protected readonly props: {
      provider: LocalDataProvider;
      /**
       * Callback when the selection in a vis changed.
       * @param visynIds Selected visyn ids.
       */
      selectionCallback(visynIds: string[]): void;
      doc: Document;
      idField?: string;
    },
  ) {
    this.node = props.doc.createElement('div');
    this.node.id = 'customVisDiv';
    this.node.classList.add('custom-vis-panel');
    this.viewable = false;
    this.idField = props.idField ?? 'id';
    this.PLOTLY_CATEGORICAL_MISSING_VALUE = i18n.t('visyn:vis.missingValue');
  }

  getSelectedList = (): string[] => {
    const selectedRows = this.props.provider.viewRaw(this.props.provider.getSelection()) as IRow[];

    return selectedRows.map((r) => r[this.idField].toString());
  };

  filterCallback = (s: string) => {
    const selectedIds = this.props.provider.getSelection();

    if (selectedIds.length === 0 && s !== EFilterOptions.CLEAR) {
      return;
    }

    this.props.provider.setFilter((row) => {
      return s === EFilterOptions.IN ? selectedIds.includes(row.i) : s === EFilterOptions.OUT ? !selectedIds.includes(row.i) : true;
    });

    this.props.selectionCallback([]);
    this.updateCustomVis();
  };

  updateCustomVis = () => {
    const ranking = this.props.provider.getFirstRanking();
    const data = this.props.provider.viewRawRows(ranking.getOrder());

    const cols: VisColumn[] = [];

    const selectedList = this.getSelectedList();

    const getColumnInfo = (column: Column): ColumnInfo => {
      return {
        // This regex strips any html off of the label and summary, leaving only the center text. For example, <div><span>Hello</span></div> would be Hello.
        name: column.getMetaData().label.replace(/(<([^>]+)>)/gi, ''),
        description: column.getMetaData().summary.replace(/(<([^>]+)>)/gi, ''),
        id: column.fqid,
      };
    };

    const mapData = <T extends ValueColumn<number | string>>(innerData: IDataRow[], column: T) => {
      return innerData.map((d) => <IVisCommonValue<ReturnType<typeof column.getRaw>>>{ id: d.v[this.idField], val: column.getRaw(d) });
    };

    const getColumnValue = async <T extends ValueColumn<number | string>>(column: T) => {
      if (column.isLoaded()) {
        return mapData(data, column);
      }

      return new Promise<IVisCommonValue<any>[]>((resolve, reject) => {
        // times out if we take longer than 60 seconds to load the columns.
        const timeout = setTimeout(() => {
          reject('Timeout');
        }, 60000);

        column.on(ValueColumn.EVENT_DATA_LOADED, () => {
          clearTimeout(timeout);
          resolve(mapData(data, column));
        });
      });
    };

    for (const c of ranking.flatColumns) {
      if (c instanceof NumberColumn) {
        cols.push({
          info: getColumnInfo(c),
          values: () => getColumnValue(c),
          type: EColumnTypes.NUMERICAL,
        });
      } else if (c instanceof CategoricalColumn) {
        cols.push({
          info: getColumnInfo(c),
          values: () => getColumnValue(c).then((res) => res.map((v) => (v.val ? v : { ...v, val: this.PLOTLY_CATEGORICAL_MISSING_VALUE }))),
          type: EColumnTypes.CATEGORICAL,
        });
      }
    }

    createRoot(this.node).render(
      React.createElement(Vis, {
        columns: cols,
        selected: selectedList,
        selectionCallback: (visynIds) => this.props.selectionCallback(visynIds),
        filterCallback: (s: string) => this.filterCallback(s),
        showCloseButton: true,
        closeCallback: () => this.hide(),
      }),
    );
  };

  toggleCustomVis = () => {
    this.viewable = !this.viewable;
    this.node.style.display = this.viewable ? 'flex' : 'none';

    this.props.provider.getFirstRanking().on(`${Ranking.EVENT_ORDER_CHANGED}.track`, this.updateCustomVis);
    this.props.provider.getFirstRanking().on(`${Ranking.EVENT_ADD_COLUMN}.track`, this.updateCustomVis);
    this.props.provider.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.track`, this.updateCustomVis);

    this.updateCustomVis();
  };

  hide = () => {
    this.viewable = false;
    this.node.style.display = 'none';
  };
}
