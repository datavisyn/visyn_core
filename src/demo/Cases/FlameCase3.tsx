import * as React from 'react';

import CimeFlameTree from './CimeFlameTree';
import { ParameterColumn } from '../FlameTree/math';
import map from 'lodash/map';
import uniq from 'lodash/uniq';

const { UseCase3 } = await import('./case_study_3');

export default function FlameCase3() {
  const columnKeys = React.useMemo(
    () => ['ligand_file_name_exp_param', 'base_file_name_exp_param', 'temperature_exp_param', 'concentration_exp_param', 'solvent_file_name_exp_param'],
    [],
  );

  const definitions = React.useMemo(() => {
    return columnKeys.map((key) => {
      return {
        key,
        domain: uniq(map(UseCase3, key)),
        type: 'categorical',
      } as ParameterColumn;
    });
  }, [columnKeys]);

  return <CimeFlameTree dataset={UseCase3} definitions={definitions} mode="prediction" maxIterations={4} />;
}