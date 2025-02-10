import * as React from 'react';

import CimeFlameTree from './CimeFlameTree';

const { UseCase3 } = await import('./case_study_3');

export default function FlameCase3() {
  const columnKeys = React.useMemo(
    () => ['ligand_file_name_exp_param', 'base_file_name_exp_param', 'temperature_exp_param', 'concentration_exp_param', 'solvent_file_name_exp_param'],
    [],
  );

  return <CimeFlameTree dataset={UseCase3} columnKeys={columnKeys} mode="prediction" maxIterations={4} />;
}