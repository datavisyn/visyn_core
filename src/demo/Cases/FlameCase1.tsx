import React from 'react';

import CimeFlameTree from './CimeFlameTree';
import { ParameterColumn } from '../FlameTree/math';
import uniq from 'lodash/uniq';
import map from 'lodash/map';

const { UseCase1 } = await import('./case_study_1');

export default function FlameCase1() {
  const columnKeys = React.useMemo(
    () => ['aryl_halide_file_name_exp_param', 'additive_file_name_exp_param', 'ligand_file_name_exp_param', 'base_file_name_exp_param'],
    [],
  );

  const definitions = React.useMemo(() => {
    return columnKeys.map((key) => {
      return {
        key,
        domain: uniq(map(UseCase1, key)),
        type: 'categorical',
      } as ParameterColumn;
    });
  }, [columnKeys]);

  return <CimeFlameTree dataset={UseCase1} definitions={definitions} mode="experiment" />;
}
