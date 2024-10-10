import { defaultConfig } from '../../constants';
import { normalizedValue } from './normalized-value';

describe('normalizedValue', () => {
  it('should check if normalized value returns a number for the given config and value', () => {
    const config = { ...defaultConfig };
    const value = 10;
    const total = 100;
    const normalized = normalizedValue({ config, value, total });
    expect(Number.isNaN(Number(normalized))).toBe(false);
  });
});
