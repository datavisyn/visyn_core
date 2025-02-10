import React from 'react';

import CimeFlameTree from './CimeFlameTree';

const { UseCase1 } = await import('./case_study_1');

export default function FlameCase1() {
  const columnKeys = React.useMemo(
    () => ['aryl_halide_file_name_exp_param', 'additive_file_name_exp_param', 'ligand_file_name_exp_param', 'base_file_name_exp_param'],
    [],
  );

  return <CimeFlameTree dataset={UseCase1} columnKeys={columnKeys} mode="experiment" />;
}
