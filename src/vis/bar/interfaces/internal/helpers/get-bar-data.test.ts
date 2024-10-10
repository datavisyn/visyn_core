import { getBarData } from './get-bar-data';

describe('getBarData', () => {
  it('should resolve the promise for getting the bar data and return an object', async () => {
    const columns: Parameters<typeof getBarData>['0'] = [];
    const catColumns: Parameters<typeof getBarData>['1'] = { id: 'id', name: 'name', description: 'description' };
    const groupColumns: Parameters<typeof getBarData>['2'] = { id: 'id', name: 'name', description: 'description' };
    const facetsColumns: Parameters<typeof getBarData>['3'] = { id: 'id', name: 'name', description: 'description' };
    const aggregateColumns: Parameters<typeof getBarData>['4'] = { id: 'id', name: 'name', description: 'description' };
    const barData = await getBarData(columns, catColumns, groupColumns, facetsColumns, aggregateColumns);
    expect(barData).toBeInstanceOf(Object);
  });
});
