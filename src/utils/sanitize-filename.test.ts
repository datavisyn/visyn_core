import { sanitize } from './sanitize-filname';

describe('sanitize', () => {
  it('should sanitize the filename', () => {
    expect(sanitize('foo/bar')).toBe('foobar');
    expect(sanitize('foo?bar')).toBe('foobar');
    expect(sanitize('foo<bar')).toBe('foobar');
    expect(sanitize('foo>bar')).toBe('foobar');
    expect(sanitize('foo\\bar')).toBe('foobar');
    expect(sanitize('foo:bar')).toBe('foobar');
    expect(sanitize('foo*bar')).toBe('foobar');
    expect(sanitize('foo|bar')).toBe('foobar');
    expect(sanitize('foo"bar')).toBe('foobar');
    expect(sanitize('foo\x00bar')).toBe('foobar');
    expect(sanitize('foo\x1fbar')).toBe('foobar');
    expect(sanitize('foo\x80bar')).toBe('foobar');
    expect(sanitize('foo\x9fbar')).toBe('foobar');
    expect(sanitize('foo...bar')).toBe('foo...bar');
    expect(sanitize('foo con.bar')).toBe('foo con.bar');
    expect(sanitize('foo prn.bar')).toBe('foo prn.bar');
    expect(sanitize('foo aux.bar')).toBe('foo aux.bar');
    expect(sanitize('foo nul.bar')).toBe('foo nul.bar');
    expect(sanitize('foo com0.bar')).toBe('foo com0.bar');
    expect(sanitize('foo lpt0.bar')).toBe('foo lpt0.bar');
    expect(sanitize('foo com.bar')).toBe('foo com.bar');
    expect(sanitize('foo lpt.bar')).toBe('foo lpt.bar');
    expect(sanitize('foo con.bar')).toBe('foo con.bar');
  });
});
