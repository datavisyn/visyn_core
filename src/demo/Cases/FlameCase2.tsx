import * as React from 'react';

import CimeFlameTree from './CimeFlameTree';

const { UseCase2 } = await import('./case_study_2');

export default function FlameCase2() {
  const columnKeys = React.useMemo(
    () => ['ligand_file_name_exp_param', 'base_file_name_exp_param', 'temperature_exp_param', 'concentration_exp_param', 'solvent_file_name_exp_param'],
    [],
  );

  return <CimeFlameTree dataset={UseCase2} columnKeys={columnKeys} mode="prediction" maxIterations={7} />;
}
