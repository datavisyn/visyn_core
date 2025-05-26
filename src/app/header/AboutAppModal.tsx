import React from 'react';

import { ActionIcon, Center, CopyButton, Divider, Group, MantineSize, Modal, Space, Text, Title, Tooltip } from '@mantine/core';

import { VisynEnv } from '../../base/VisynEnv';
import { generateVersionInfo } from '../../base/versionInfoUtils';
import { useVisynAppContext } from '../VisynAppContext';

/**
 * Configuration for the about app modal. Can
 * be used to define size, content and bottom section.
 */
export interface IAboutAppModalConfig {
  // Middle section of the modal
  content?: JSX.Element;
  // Bottom section of the modal
  bottom?: JSX.Element;
  customerLogo?: JSX.Element;
  size?: MantineSize | number | string;
}

export function AboutAppModalBottom({ appName, customerLogo, dvLogo }: { appName: string | JSX.Element; customerLogo?: JSX.Element; dvLogo?: JSX.Element }) {
  return (
    <Center my="md">
      <Text c="dimmed" style={{ textAlign: 'center' }}>
        {appName || 'This application '} is developed by{' '}
        <Center mt="md">
          {customerLogo}
          {customerLogo ? <Space w="lg" /> : null}
          {dvLogo}
        </Center>
      </Text>
    </Center>
  );
}

export function AboutAppModal({
  size = 'md',
  content,
  opened,
  onClose,
  dvLogo = undefined,
  bottom,
  customerLogo = undefined,
}: {
  opened: boolean;
  onClose: () => void;
  dvLogo?: JSX.Element;
  customerLogo?: JSX.Element;
} & IAboutAppModalConfig) {
  const { appName } = useVisynAppContext();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4} fw="bold">
          {appName}
        </Title>
      }
      size={size}
    >
      <Group my="md">{content}</Group>
      <Group gap="xs" wrap="nowrap">
        {VisynEnv.__VERSION__ ? (
          <Group gap="xs" wrap="nowrap">
            <Text fw={700} c="dimmed">
              Version:
            </Text>
            <Text>
              {VisynEnv.__VERSION__} {VisynEnv.__BUILD_ID__ ? ` (${VisynEnv.__BUILD_ID__})` : ''}
            </Text>
          </Group>
        ) : null}

        <CopyButton value={generateVersionInfo()} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label="copy" withArrow withinPortal>
              <ActionIcon
                color={copied ? 'teal' : 'dvGray'}
                variant="subtle"
                onClick={() => {
                  copy();
                }}
                style={{ pointerEvents: 'all' }}
              >
                {copied ? <i className="fa-solid fa-check" /> : <i className="fa-regular fa-copy" />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      <Divider />
      {bottom === undefined ? <AboutAppModalBottom appName={appName} customerLogo={customerLogo} dvLogo={dvLogo} /> : bottom}
    </Modal>
  );
}
