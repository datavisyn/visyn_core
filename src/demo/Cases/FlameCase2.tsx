import * as React from 'react';

import CimeFlameTree from './CimeFlameTree';
import { ParameterColumn } from '../FlameTree/math';
import map from 'lodash/map';
import uniq from 'lodash/uniq';

const { UseCase2 } = await import('./case_study_2');

export default function FlameCase2() {
  const columnKeys = React.useMemo(
    () => ['ligand_file_name_exp_param', 'base_file_name_exp_param', 'temperature_exp_param', 'concentration_exp_param', 'solvent_file_name_exp_param'],
    [],
  );

  const definitions = React.useMemo(() => {
    return columnKeys.map((key) => {
      return {
        key,
        domain: uniq(map(UseCase2, key)),
        type: 'categorical',
      } as ParameterColumn;
    });
  }, [columnKeys]);

  return <CimeFlameTree dataset={UseCase2} definitions={definitions} mode="prediction" maxIterations={7} />;
}
