export interface IChangeLogArticle {
  title?: string;
  version: string;
  author: string;
  content: any;
  date: Date;
  tags: string[];
}
