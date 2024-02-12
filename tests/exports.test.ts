/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/// <reference types="jest" />
import { readdirSync, readFileSync } from 'fs';
import packageJson from '../package.json';

const NOT_EXPORTED_PACKAGES = ['assets', 'demo', 'locales', 'scss', 'stories'];
const ADDITIONAL_EXPORTS = ['.', './assets/*', './plotly/full', './scss/*', './dist/scss/*', './phovea_registry', './package.json'];

describe('package.json exports', () => {
  expect(packageJson.exports).toBeDefined();
  const allPackages = readdirSync('./src', { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !NOT_EXPORTED_PACKAGES.includes(name));

  // Check if we have exactly as many exports as defined
  expect(Object.keys(packageJson.exports)).toHaveLength(allPackages.length + ADDITIONAL_EXPORTS.length);

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
    // Some packages are exported as .tsx
    const extension = exported?.types[1]?.includes('.tsx') ? 'tsx' : 'ts';
    expect(exported.types).toEqual([`./dist/${p}/index.d.ts`, `./src/${p}/index.${extension}`]);
    expect(exported.import).toEqual([`./dist/${p}/index.js`, `./src/${p}/index.${extension}`]);
    expect(exported.default).toEqual([`./dist/${p}/index.js`, `./src/${p}/index.${extension}`]);
    expect(rootIndexTs).toBeFalsy();
  });

  it('exports the package.json and phovea_registry', () => {
    expect(packageJson.exports['./phovea_registry']).toEqual(['./dist/phovea_registry.js', './src/phovea_registry.ts']);
    expect(packageJson.exports['./package.json']).toBe('./package.json');
  });
});
