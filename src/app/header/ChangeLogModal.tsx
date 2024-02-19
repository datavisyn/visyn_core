/* eslint-disable no-await-in-loop */
import * as React from 'react';
import { Modal, Title } from '@mantine/core';
import { ChangeLogComponent } from '../../components/ChangeLog/ChangeLogComponent';
import readmeBioInSight from '../../components/ChangeLog/DemoReleaseNotesBioInSight.md';
import readmeAelixir from '../../components/ChangeLog/DemoReleaseNotesAelixir.md';
import readmeBioInSight2 from '../../components/ChangeLog/DemoReleaseNotesBioInSight2.md';
import readMeDemoFormatter from '../../components/ChangeLog/DemoFormatter.md';
import { IChangeLogArticle } from '../../components/ChangeLog/interfaces';
import { parseFrontmatter } from '../../components/ChangeLog/utils';

async function fillData(): Promise<IChangeLogArticle[]> {
  const data: IChangeLogArticle[] = [];
  for (let index = 0; index <= 10; index++) {
    data.push(await parseFrontmatter(readMeDemoFormatter));
    data.push(await parseFrontmatter(readmeBioInSight));
    data.push(await parseFrontmatter(readmeAelixir));
  }
  return data;
}

const data = await fillData();

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
      <ChangeLogComponent data={data} />
    </Modal>
  );
}
