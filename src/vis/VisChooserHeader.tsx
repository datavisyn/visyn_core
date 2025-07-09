import * as React from 'react';

import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { ActionIcon, Text, Group, Tooltip, Anchor } from '@mantine/core';

import { i18n } from '../i18n';

export function VisChooserHeader({ selectedType, onClickContinue }: { selectedType: string | null; onClickContinue: () => void }) {
  return (
    <Group justify="space-between" p={5}>
      <Text c="dimmed" size="sm">
        {i18n.t('visyn:vis.visTypeChooserTitle')}
      </Text>

      <Anchor
        component="button"
        c="dark"
        ta="left"
        type="button"
        size="sm"
        mr={5}
        onClick={onClickContinue}
        data-testid="visyn-vis-chooser-header-continue-button"
      >
        {i18n.t('visyn:vis.continueWithSelectedType', { selectedType })}
        <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 5 }} />
      </Anchor>
    </Group>
  );
}
