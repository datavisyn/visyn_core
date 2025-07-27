import * as React from 'react';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Anchor, Box, Group, Tooltip } from '@mantine/core';

import { i18n } from '../i18n';

export function VisPlotHeader({
  enableSidebar,
  showSidebar,
  isOpenSidebar,
  enableVisTypeChooser,
  onClickSettings,
  onClickBack,
}: {
  isOpenSidebar?: boolean;
  enableSidebar?: boolean;
  showSidebar?: boolean;
  enableVisTypeChooser?: boolean;
  onClickSettings: () => void;
  onClickBack: () => void;
}) {
  return (
    <Group justify="space-between" p={5}>
      {enableVisTypeChooser ? (
        <Tooltip label="Go to visualization chooser" position="top" withArrow withinPortal>
          <Anchor component="button" c="dark" ta="left" type="button" size="sm" onClick={onClickBack} data-testid="visyn-vis-plot-header-back-button">
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
            {i18n.t('visyn:vis.chartOverview')}
          </Anchor>
        </Tooltip>
      ) : (
        <Box />
      )}
      {enableSidebar && !showSidebar ? (
        <Tooltip label={isOpenSidebar ? i18n.t('visyn:vis.closeSettings') : i18n.t('visyn:vis.openSettings')}>
          <ActionIcon onClick={onClickSettings} variant="transparent" color="dark">
            <FontAwesomeIcon icon={faGear} />
          </ActionIcon>
        </Tooltip>
      ) : null}
    </Group>
  );
}
