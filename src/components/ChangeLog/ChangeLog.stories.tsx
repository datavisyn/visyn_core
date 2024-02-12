// /* eslint-disable no-await-in-loop */
// import * as React from 'react';
// import { StoryObj } from '@storybook/react';
// import { ChangeLogComponent } from './ChangeLogComponent';
// import readmeBioInSight from './DemoReleaseNotesBioInSight.md';
// import readmeAelixir from './DemoReleaseNotesAelixir.md';
// import readmeBioInSight2 from './DemoReleaseNotesBioInSight2.md';
// import readMeDemoFormatter from './DemoFormatter.md';
// import { IChangeLogArticle } from './interfaces';
// import { parseFrontmatter } from './utils';

// export default {
//   title: 'Example/Ui/ChangeLog',
//   component: ChangeLogComponent,
// };

// type Story = StoryObj<typeof ChangeLogComponent>;

// async function fillData(): Promise<IChangeLogArticle[]> {
//   const data: IChangeLogArticle[] = [];
//   for (let index = 0; index <= 10; index++) {
//     data.push(await parseFrontmatter(readMeDemoFormatter));
//     data.push(await parseFrontmatter(readmeBioInSight));
//     data.push(await parseFrontmatter(readmeBioInSight2));
//     data.push(await parseFrontmatter(readmeAelixir));
//   }
//   return data;
// }

// const data = await fillData();

// export const SecondarySelfmadeChangeLog: Story = {
//   render: () => <ChangeLogComponent data={data} />,
// };
