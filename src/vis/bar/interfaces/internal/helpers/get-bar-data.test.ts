import { getBarData } from './get-bar-data';
import { ColumnInfo } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../../stories/fetchBreastCancerData';
import { defaultConfig } from '../../constants';

const config = { ...defaultConfig };

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

  it('should return breast cancer data', async () => {
    const configPayload = { ...config, catColumnSelected: { id: 'breastSurgeryType', name: 'Breast Surgery Type', description: 'some very long description' } };
    const data = await getBarData(
      fetchBreastCancerData(),
      configPayload.catColumnSelected,
      configPayload.group,
      configPayload.facets,
      configPayload.aggregateColumn,
    );
    expect(data.catColVals.info).toEqual({ id: 'breastSurgeryType', name: 'Breast Surgery Type', description: 'some very long description' });
    expect(data.catColVals.resolvedValues.length).toBe(1904);
    expect(data.catColVals.type.toLowerCase()).toBe('categorical');
    expect(data.groupColVals).toBe(null);
    expect(data.aggregateColVals).toBe(null);
    expect(data.facetsColVals).toBe(null);
  });

  it('should return breast cancer data with group, aggregate and facet column', async () => {
    const configPayload = {
      ...config,
      catColumnSelected: { id: 'breastSurgeryType' },
      group: { id: 'tumorSize' },
      facets: { id: 'cellularity' },
    };
    const data = await getBarData(
      fetchBreastCancerData(),
      configPayload.catColumnSelected as ColumnInfo,
      configPayload.group as ColumnInfo,
      configPayload.facets as ColumnInfo,
      configPayload.aggregateColumn as ColumnInfo,
    );
    expect(data.catColVals.info).toEqual({ id: 'breastSurgeryType', name: 'Breast Surgery Type', description: 'some very long description' });
    expect(data.catColVals.resolvedValues.length).toBe(1904);
    expect(data.catColVals.type.toLowerCase()).toBe('categorical');

    expect(data.groupColVals.info).toEqual({ description: 'some very long description', id: 'tumorSize', name: 'Tumor Size' });
    expect(data.groupColVals.resolvedValues.length).toBe(1904);
    expect(data.groupColVals.type.toLowerCase()).toBe('numerical');

    expect(data.aggregateColVals).toBe(null);

    expect(data.facetsColVals.info).toEqual({ description: null, id: 'cellularity', name: 'Cellularity' });
    expect(data.facetsColVals.resolvedValues.length).toBe(1904);
    expect(data.facetsColVals.type.toLowerCase()).toBe('categorical');
  });
});
