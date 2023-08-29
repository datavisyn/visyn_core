import * as React from 'react';
import { Modal, Title } from '@mantine/core';
import { ChangeLogComponent } from '../../components/ChangeLog/ChangeLogComponent';
import readmeBioInSight from '../../components/ChangeLog/DemoReleaseNotesBioInSight.md';
import readmeAelixir from '../../components/ChangeLog/DemoReleaseNotesAelixir.md';
import readmeBioInSight2 from '../../components/ChangeLog/DemoReleaseNotesBioInSight2.md';

function FillData() {
  const data = [];
  for (let index = 0; index <= 15; index++) {
    data.push({
      title: 'This is a title',
      version: `Release version 1.2.2 ${index}`,
      author: 'username',
      content: readmeBioInSight,
      date: new Date(2011, 0, 1),
      tags: ['Feature', 'Devops'],
    });
    data.push({ version: `Release v2.1.0 ${index}`, author: 'otherusername', content: readmeAelixir, date: new Date(2023, 7, 1), tags: ['Bug'] });
    data.push({
      title: 'This is a different title',
      version: `Release this week ${index}`,
      author: 'myusername',
      content: readmeBioInSight2,
      date: new Date(2023, 7, 14),
      tags: ['Release'],
    });
  }
  return data;
}

export function ChangeLogModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4} weight={400}>
          ChangeLog
        </Title>
      }
      fullScreen
    >
      <ChangeLogComponent data={FillData()} />
    </Modal>
  );
}
