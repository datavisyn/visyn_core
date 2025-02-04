import * as React from 'react';

import { Text } from '@mantine/core';
import map from 'lodash/map';
import uniq from 'lodash/uniq';

import { VisynApp, VisynHeader } from '../app';
import { FlameTree } from './FlameTree';
import { UseCase1 } from './FlameTree/case_study_1';
import { ParameterColumn } from './FlameTree/math';

const ArylColumn: ParameterColumn = {
  key: 'aryl_halide_file_name_exp_param',
  domain: uniq(map(UseCase1, 'aryl_halide_file_name_exp_param')),
  type: 'categorical',
};

const AdditiveColumn: ParameterColumn = {
  key: 'additive_file_name_exp_param',
  domain: uniq(map(UseCase1, 'additive_file_name_exp_param')),
  type: 'categorical',
};

const LigandColumn: ParameterColumn = {
  key: 'ligand_file_name_exp_param',
  domain: uniq(map(UseCase1, 'ligand_file_name_exp_param')),
  type: 'categorical',
};

const BaseColumn: ParameterColumn = {
  key: 'base_file_name_exp_param',
  domain: uniq(map(UseCase1, 'base_file_name_exp_param')),
  type: 'categorical',
};

export function MainApp() {
  const definitions = React.useMemo(() => {
    return [ArylColumn, BaseColumn, LigandColumn, AdditiveColumn];
  }, []);

  const [layering, setLayering] = React.useState<string[]>([
    'aryl_halide_file_name_exp_param',
    'base_file_name_exp_param',
    'ligand_file_name_exp_param',
    'additive_file_name_exp_param',
  ]);

  return (
    <VisynApp
      header={
        <VisynHeader
          components={{
            aboutAppModal: {
              content: <Text>This is the demo app for visyn core.</Text>,
            },
            center: (
              <Text c="white" size="sm">
                Waffle Plot Demo
              </Text>
            ),
          }}
        />
      }
    >
      <FlameTree definitions={definitions} layering={layering} setLayering={setLayering} experiments={UseCase1} />
    </VisynApp>
  );
}
