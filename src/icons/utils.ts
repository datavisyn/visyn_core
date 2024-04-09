import { injectGlobal } from '@emotion/css';
import * as Icons from './Icons';
import * as EntityIcons from './EntityIcons';

/**
 * Converts camelCase string to kebab-case
 * @param camelCaseString string in camelCase
 * @returns string in kebab-case
 */
function camelToKebab(camelCaseString: string) {
  return camelCaseString.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const generateCustomIconClasses = (icons) => {
  const getSVG = (customPath, width, height) =>
    `data:image/svg+xml,%3Csvg width='${width}' height='${height}' fill='inherit' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${customPath}' /%3E%3C/svg%3E`;

  // go over all icons and generate 2 css classes: one for the icon itself (:before) and one for the icon's container
  const customIconClasses = Object.keys(icons).map((k) => {
    // get svg + path from icon definition in Icons.tsx / EntityIcons.tsx
    let svg = getSVG(icons[k].icon[4], icons[k].icon[0], icons[k].icon[1]);

    // replace multiple spaces with single space
    svg = svg.replace(/\s+/g, ' ');

    // content: '11'; is needed to size the icon correctly
    return `.${camelToKebab(k)}::before {
          background-color: currentColor;
          content: '11';
          -webkit-mask-image: url("${svg}");
          mask-image: url("${svg}");
          mask-size: contain;
          mask-position: center;
          mask-repeat: no-repeat;
          font-size: inherit;
        }
        .${camelToKebab(k)} {
          font-size: inherit;
          font-family: 'Font Awesome 6 Free';
        }`;
  });
  return customIconClasses.join(' ');
};

/**
 * Injects custom icons into the global css
 */
export const injectCustomIcons = () => {
  injectGlobal`
    ${generateCustomIconClasses(Icons)}
    ${generateCustomIconClasses(EntityIcons)}
  `;
};
