import * as React from 'react';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function HelpHoverCard({ title, content, dataCyPrefix }: { title: JSX.Element; content: React.ReactNode; dataCyPrefix?: string }) {
  return (
    <Group align="center" mb={2} justify="space-between" wrap="nowrap">
      {title}
      <Tooltip label={content} withArrow>
        <ActionIcon variant="transparent" color="gray">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
