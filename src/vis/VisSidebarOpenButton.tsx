import * as React from 'react';

import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';

import { i18n } from '../i18n';

export function VisSidebarOpenButton({ isOpen, onClick }: { isOpen?: boolean; onClick: () => void }) {
  return (
    <Tooltip label={isOpen ? i18n.t('visyn:vis.closeSettings') : i18n.t('visyn:vis.openSettings')}>
      <ActionIcon style={{ zIndex: 10, position: 'absolute' }} top={12} right={10} onClick={onClick} variant="transparent" color="dark">
        <FontAwesomeIcon icon={faGear} />
      </ActionIcon>
    </Tooltip>
  );
}
