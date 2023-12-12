import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import React from 'react';

export function HelpHoverCard({ title, content, dataCyPrefix }: { title: JSX.Element; content: React.ReactNode; dataCyPrefix?: string }) {
  return (
    <Group align="center" mb={2} justify="space-between" wrap="nowrap">
      {title}
      <Tooltip label={content} withArrow>
        <ActionIcon>
          <FontAwesomeIcon icon={faQuestionCircle} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
