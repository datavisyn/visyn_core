import { Center, Divider, Group, MantineSize, Modal, Space, Text, Title } from '@mantine/core';
import React from 'react';
import { useVisynAppContext } from '../VisynAppContext';
import { WebpackEnv } from '../../base';

/**
 * Configuration for the about app modal. Can
 * be used to define size, content and bottom section.
 */
export interface IAboutAppModalConfig {
  // Middle section of the modal
  content: JSX.Element;
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
  dvLogo = null,
  bottom,
  customerLogo = null,
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
      {WebpackEnv.__VERSION__ ? (
        <>
          <Group style={{ gap: '4px' }}>
            <Text fw={700} c="dimmed">
              Version:
            </Text>
            <Text>
              {WebpackEnv.__VERSION__} {WebpackEnv.__BUILD_ID__ ? ` (${WebpackEnv.__BUILD_ID__})` : ''}
            </Text>
          </Group>
          <Space h="md" />
        </>
      ) : null}
      <Divider />
      {bottom === undefined ? <AboutAppModalBottom appName={appName} customerLogo={customerLogo} dvLogo={dvLogo} /> : bottom}
    </Modal>
  );
}
