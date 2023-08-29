import * as React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import { matter } from 'vfile-matter';
import { IChangeLogArticle } from './interfaces';

/**
 * Plugin to parse YAML frontmatter and expose it at `file.data.matter`.
 *
 * @type {import('unified').Plugin<Array<void>>}
 */
function myUnifiedPluginHandlingYamlMatter() {
  // See https://github.com/remarkjs/remark-frontmatter/tree/main#example-frontmatter-as-metadata
  return function (_, file) {
    matter(file);
  };
}

/**
 * Parses the content of a markdown file for frontmatter and returns it.
 * @param content
 * @returns
 */
export async function parseFrontmatter(content: string): Promise<IChangeLogArticle> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .use(myUnifiedPluginHandlingYamlMatter)
    .process(content);

  // TODO: Check validity of object and raise error if any fields are failing
  const parsed = file?.data?.matter || {};
  return {
    ...parsed,
    // TODO: Parse from file?.data?.matter?.date
    date: new Date(file?.data?.matter?.date),
    content,
  };
}
