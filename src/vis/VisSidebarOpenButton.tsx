import * as React from 'react';
import { ActionIcon, Center, Container, Group, Stack, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { i18n } from '../i18n';

export function VisSidebarOpenButton({ isOpen, onClick }: { isOpen?: boolean; onClick: () => void }) {
  return (
    <Tooltip label={isOpen ? i18n.t('visyn:vis.closeSettings') : i18n.t('visyn:vis.openSettings')}>
      <ActionIcon style={{ zIndex: 10, position: 'absolute', top: '10px', right: '10px' }} onClick={onClick}>
        <FontAwesomeIcon icon={isOpen ? faClose : faGear} />
      </ActionIcon>
    </Tooltip>
  );
}
