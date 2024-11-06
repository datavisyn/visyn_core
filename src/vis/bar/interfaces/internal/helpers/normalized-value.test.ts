import { defaultConfig } from '../../constants';
import { EBarDisplayType, EBarGroupingType } from '../../enums';
import { normalizedValue } from './normalized-value';

const config = { ...defaultConfig };
describe('normalizedValue', () => {
  it('should check if normalized value returns a number for the given config and value', () => {
    expect(Number.isNaN(Number(normalizedValue(config, 10, 100)))).toBe(false);
  });

  it('should return the normalized value for the given config and value with no grouping configuration', () => {
    expect(normalizedValue(config, 10, 100)).toBe(10);
  });

  it('should return the normalized value for the given config and value with a grouping configuration', () => {
    expect(
      normalizedValue(
        { ...config, group: { id: '', name: '', description: '' }, groupType: EBarGroupingType.STACK, display: EBarDisplayType.NORMALIZED },
        10,
        200,
      ),
    ).toBe(5);
  });

  it('should return null for Infinity and -Infinity values', () => {
    expect(normalizedValue(config, Infinity, 100)).toBe(null);
    expect(normalizedValue(config, -Infinity, 100)).toBe(null);
  });
});
