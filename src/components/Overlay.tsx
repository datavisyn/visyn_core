import { IconDefinition, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, Stack, Text } from '@mantine/core';
import React from 'react';

export function HelpOverlay({ text, showIcon, fontAwesomeIcon = faArrowLeft }: { text: string; showIcon?: boolean; fontAwesomeIcon?: IconDefinition }) {
  return (
    <Group position="center" pt="xl">
      <Stack>
        <Text style={{ zIndex: 9999 }} color="dimmed" size={24}>
          {text}
        </Text>
        {showIcon ? <FontAwesomeIcon style={{ zIndex: 9999 }} color="darkgray" size="3x" icon={fontAwesomeIcon} /> : null}
      </Stack>
    </Group>
  );
}
