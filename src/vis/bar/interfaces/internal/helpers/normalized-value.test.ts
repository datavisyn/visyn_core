import { defaultConfig } from '../../constants';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { normalizedValue } from './normalized-value';

const config = { ...defaultConfig };
describe('normalizedValue', () => {
  it('should check if normalized value returns a number for the given config and value', () => {
    expect(Number.isNaN(Number(normalizedValue({ config, value: 10, total: 100 })))).toBe(false);
  });

  it('should return the normalized value for the given config and value with no grouping configuration', () => {
    expect(normalizedValue({ config, value: 10, total: 100 })).toBe(10);
  });

  it('should return the normalized value for the given config and value with a grouping configuration', () => {
    expect(
      normalizedValue({
        config: { ...config, group: { id: '', name: '', description: '' }, groupType: EBarGroupingType.STACK, display: EBarDisplayType.NORMALIZED },
        value: 10,
        total: 200,
      }),
    ).toBe(5);
  });

  it('should return null for Infinity and -Infinity values', () => {
    expect(normalizedValue({ config, value: Infinity, total: 100 })).toBe(null);
    expect(normalizedValue({ config, value: -Infinity, total: 100 })).toBe(null);
  });
});
