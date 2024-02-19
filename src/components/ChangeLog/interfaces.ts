export interface IChangeLogArticle {
  title?: string;
  version: string;
  author: string;
  content: string;
  date: Date;
  tags: string[];
}
