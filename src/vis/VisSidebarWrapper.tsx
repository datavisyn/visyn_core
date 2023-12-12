import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Box, Divider, Group, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import * as React from 'react';
import { ReactNode } from 'react';
import { i18n } from '../i18n';
import { VisTypeSelect } from './sidebar/VisTypeSelect';

const sidebarSize = 200;

export function VisSidebarWrapper({ children, config, setConfig, onClick }: { children: ReactNode; config; setConfig; onClick }) {
  return (
    <Box pt="sm" style={{ height: '100%', boxShadow: '2px 0px 15px 0px lightgray', zIndex: 5 }}>
      <Group gap={0} style={{ width: '100%', height: '100%' }} wrap="nowrap">
        <ScrollArea p={0} w={`${sidebarSize}px`} h="100%">
          <Box pb="xl" style={{ height: '100%', width: `${sidebarSize}px` }}>
            <Stack gap="xs" px="xs">
              <Group justify="space-between">
                <Text>Settings</Text>
                <Tooltip label={i18n.t('visyn:vis.closeSettings')}>
                  <ActionIcon onClick={onClick}>
                    <FontAwesomeIcon icon={faClose} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <VisTypeSelect callback={(type) => setConfig({ ...config, type })} currentSelected={config.type} />
              <Divider />
              {children}
            </Stack>
          </Box>
        </ScrollArea>
      </Group>
    </Box>
  );
}
