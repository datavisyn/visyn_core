import { faClose } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';
import * as React from 'react';
import { i18n } from '../i18n';

export function VisSidebarOpenButton({ isOpen, onClick }: { isOpen?: boolean; onClick: () => void }) {
  return (
    <Tooltip withinPortal label={isOpen ? i18n.t('visyn:vis.closeSettings') : i18n.t('visyn:vis.openSettings')}>
      <ActionIcon sx={{ zIndex: 10, position: 'absolute', top: '10px', right: '10px' }} onClick={onClick}>
        <FontAwesomeIcon icon={isOpen ? faClose : faGear} />
      </ActionIcon>
    </Tooltip>
  );
}
