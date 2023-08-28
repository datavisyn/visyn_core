import * as React from 'react';
import { StoryObj } from '@storybook/react';
import { ChangeLogComponent } from './ChangeLogComponent';
import readmeBioInSight from './DemoReleaseNotesBioInSight.md';
import readmeAelixir from './DemoReleaseNotesAelixir.md';
import readmeBioInSight2 from './DemoReleaseNotesBioInSight2.md';
import readMeDemoFormatter from './DemoFormatter.md';

export default {
  title: 'Example/Ui/ChangeLog',
  component: ChangeLogComponent,
};

type Story = StoryObj<typeof ChangeLogComponent>;

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

/* Note: for datatype Date month count starts at 0, that means January = 0 */
export const SecondarySelfmadeChangeLog: Story = {
  render: () => <ChangeLogComponent data={FillData()} />,
};
