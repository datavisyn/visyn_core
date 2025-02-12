import React from 'react';

import CimeFlameTree from './CimeFlameTree';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import { ParameterColumn } from '../FlameTree/math';

const { ExampleCase } = await import('./example_study');

export default function FlameCase1() {
  const columnKeys = React.useMemo(() => ['category', 'subcategory'], []);

  const definitions = React.useMemo(() => {
    return [
      {
        key: 'category',
        domain: uniq(map(ExampleCase, 'category')),
        type: 'categorical',
      },
      {
        key: 'subcategory',
        domain: uniq(map(ExampleCase, 'subcategory')),
        type: 'categorical',
      },
      {
        key: 'coolness',
        domain: [0, 100],
        type: 'numerical',
      }
    ] as ParameterColumn[];
  }, [columnKeys]);

  return <CimeFlameTree dataset={ExampleCase} definitions={definitions} mode="experiment" />;
}
