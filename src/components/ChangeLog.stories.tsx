import * as React from 'react';
import { StoryObj } from '@storybook/react';
import { ChangeLogComponent } from './ChangeLogComponent';
import readmeBioInSight from './DemoReleaseNotesBioInSight.md';
import readmeAelixir from './DemoReleaseNotesAelixir.md';
import readmeBioInSight2 from './DemoReleaseNotesBioInSight2.md';

export default {
  title: 'Example/Ui/ChangeLog',
  component: ChangeLogComponent,
};

type Story = StoryObj<typeof ChangeLogComponent>;

/* Note: for datatype Date month count starts at 0, that means January = 0 */
export const SecondarySelfmadeChangeLog: Story = {
  render: () => (
    <ChangeLogComponent
      data={[
        { title: 'Release version 1.2.2', author: 'username', content: readmeBioInSight, date: new Date(1111, 0, 1), tags: ['Feature', 'Devops'] },
        { title: 'Release v2.1.0', author: 'otherusername', content: readmeAelixir, date: new Date(2023, 7, 1), tags: ['Bug'] },
        { title: 'Release this week', author: 'myusername', content: readmeBioInSight2, date: new Date(2023, 7, 14), tags: ['Release'] },
      ]}
    />
  ),
};
