import { ColumnBuilder, IStringColumnDesc } from 'lineupjs';

export default class SMILESColumnBuilder extends ColumnBuilder<IStringColumnDesc> {
  constructor(column: string) {
    super('smiles', column);
  }
}

/**
 * builds a smiles column builder
 * @param {string} column column which contains the associated data
 * @returns {StringColumnBuilder}
 */
export function buildSMILESColumn(column: string) {
  return new SMILESColumnBuilder(column);
}
