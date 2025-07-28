import * as React from 'react';

import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Anchor, Group, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import { i18n } from '../i18n';
import './VisChooserHeader.scss';

export function VisChooserHeader({ selectedType, onClickContinue }: { selectedType?: string; onClickContinue: () => void }) {
  const { ref, width } = useElementSize();

  const ratioClass = width > 0 ? `vis-chooser-header-${width < 1000 ? 2 : 1}` : '';

  return (
    <Group ref={ref} justify="space-between" p={5} className={ratioClass} data-testid="visyn-vis-chooser-header">
      <Text c="dimmed" size="sm">
        {i18n.t('visyn:vis.visTypeChooserTitle')}
      </Text>

      {selectedType ? (
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
      ) : null}
    </Group>
  );
}
