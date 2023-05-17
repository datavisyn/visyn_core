import { ALineUp, Column, DataBuilder, IRankingHeaderContext, LocalDataProvider, defaultOptions, dialogContext } from 'lineupjs';
import { uniqueId } from 'lodash';
import { SMILESColumn } from './SMILESColumn';
import { SMILESRenderer } from './SMILESRenderer';
import { SMILESFilterDialog } from './SMILESFilterDialog';

export function registerSMILESColumn(builder: DataBuilder, { setDynamicHeight = false }: { setDynamicHeight?: boolean } = {}) {
  builder.registerColumnType('smiles', SMILESColumn);
  builder.registerRenderer('smiles', new SMILESRenderer());
  builder.registerToolbarAction(
    'filterSMILES',
    // TODO remove default string filter; use `filterString` as key would override the default string filter, but also for string columns
    {
      title: 'Filter …', // the toolbar icon is derived from this string! (= transformed to `lu-action-filter`)
      onClick: (col: SMILESColumn, evt: MouseEvent, ctx: IRankingHeaderContext, level: number, viaShortcut: boolean) => {
        const dialog = new SMILESFilterDialog(col, dialogContext(ctx, level, evt), ctx);
        dialog.open();
      },
      options: {
        mode: 'menu+shortcut',
        featureCategory: 'ranking',
        featureLevel: 'basic',
      },
    },
  );

  if (setDynamicHeight) {
    builder.dynamicHeight((d, ranking) => {
      const DEFAULT_ROW_HEIGHT = defaultOptions().rowHeight; // LineUp default rowHeight = 18

      // get list of smiles columns from the current ranking
      const smilesColumns = ranking.children.filter((col) => col instanceof SMILESColumn);

      if (smilesColumns.length === 0) {
        return { defaultHeight: DEFAULT_ROW_HEIGHT, height: () => DEFAULT_ROW_HEIGHT, padding: () => 0 };
      }

      const maxColumnHeight = Math.max(DEFAULT_ROW_HEIGHT, ...smilesColumns.map((col) => col.getWidth())); // squared image -> use col width as height

      return {
        defaultHeight: maxColumnHeight,
        height: () => maxColumnHeight,
        padding: () => 0,
      };
    });
  }
}

export function autosizeWithSMILESColumn({ provider, lineup }: { provider: LocalDataProvider; lineup: ALineUp }) {
  const uid = uniqueId('smiles-column');

  const addWidthChangedListener = (col: Column) => {
    if (col instanceof SMILESColumn) {
      col.on(`${Column.EVENT_WIDTH_CHANGED}.${uid}`, () => {
        // trigger a re-render of LineUp using the new calculated row height in `dynamicHeight()`
        lineup.update();
      });
    }
  };

  // Add width changed listener for new smiles columns
  provider.on(`${LocalDataProvider.EVENT_ADD_COLUMN}.${uid}`, (col) => addWidthChangedListener(col));

  // And remove it again when the column is removed
  provider.on(`${LocalDataProvider.EVENT_REMOVE_COLUMN}.${uid}`, (col) => {
    if (col instanceof SMILESColumn) {
      col.on(`${Column.EVENT_WIDTH_CHANGED}.${uid}`, null); // remove event listener when column is removed
    }
  });

  // Add width changed listener for existing smiles columns
  provider.getRankings().forEach((ranking) => ranking.flatColumns.forEach((col) => addWidthChangedListener(col)));
}
