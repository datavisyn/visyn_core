import { IconDefinition, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, Stack, Text } from '@mantine/core';
import React from 'react';

export function HelpOverlay({ text, showIcon, fontAwesomeIcon = faBan }: { text: string; showIcon?: boolean; fontAwesomeIcon?: IconDefinition }) {
  return (
    <Group justify="center" pt="xl">
      <Stack>
        <Text style={{ zIndex: 9999 }} c="dimmed" size="lg">
          {text}
        </Text>
        {showIcon ? <FontAwesomeIcon style={{ zIndex: 9999 }} color="darkgray" size="3x" icon={fontAwesomeIcon} /> : null}
      </Stack>
    </Group>
  );
}
