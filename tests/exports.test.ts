/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/// <reference types="jest" />
import { readdirSync, readFileSync } from 'fs';
import packageJson from '../package.json';

const NOT_EXPORTED_PACKAGES = ['assets', 'demo', 'locales', 'scss', 'stories'];

describe('package.json exports', () => {
  expect(packageJson.exports).toBeDefined();
  const allPackages = readdirSync('./src', { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !NOT_EXPORTED_PACKAGES.includes(name));
  expect(allPackages.length).toBeGreaterThan(0);

  const rootIndexTs = readFileSync('./src/index.ts', 'utf-8').toString();

  /*
    Tests if each package is properly exported as:

    "./<package>": {
      "types": "./dist/<package>/index.d.ts",
      "import": "./dist/<package>/index.js",
      "default": "./dist/<package>/index.js"
    }
  */
  test.each(allPackages)('checks if package %s is exported', (p) => {
    const exported = packageJson.exports[`./${p}`];
    expect(exported).toBeDefined();
    expect(Object.keys(exported)).toStrictEqual(['types', 'import', 'default']);
    expect(exported.types).toBe(`./dist/${p}/index.d.ts`);
    expect(exported.import).toBe(`./dist/${p}/index.js`);
    expect(exported.default).toBe(`./dist/${p}/index.js`);
    expect(rootIndexTs).toContain(`export * from './${p}';`);
  });

  it('exports the package.json and phovea_registry', () => {
    expect(packageJson.exports['./phovea_registry']).toBe('./dist/phovea_registry.js');
    expect(packageJson.exports['./package.json']).toBe('./package.json');
  });
});
