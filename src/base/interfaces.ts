import type { ICategory } from 'lineupjs';
import { IUser } from '../security';
import { IPluginDesc } from '../plugin/interfaces';

/**
 * common interface for a row as used in LineUp
 */
export interface IRow {
  /**
   * id, e.g. ESNGxxxx
   */
  readonly id: string;

  [key: string]: any;
}

export interface IBaseViewPluginDesc extends Partial<Omit<IPluginDesc, 'type' | 'id' | 'load'>> {
  /**
   * how many selection this view can handle and requires
   */
  selection: 'none' | '0' | 'any' | 'single' | '1' | 'small_multiple' | 'multiple' | 'chooser' | 'some' | '2';
  /**
   * idType regex that is required by this view
   */
  idtype?: string;
  /**
   * view group hint
   */
  group: { name: string; order: number };
  /**
   * optional preview callback function returning a url promise, the preview image should have 320x180 px
   * @returns {Promise<string>}
   */
  preview?(): Promise<string>;
  /**
   * optional security check to show only certain views
   */
  security?: string | ((user: IUser) => boolean);
  /**
   * a lot of topics/tags describing this view
   */
  topics?: string[];
  /**
   * a link to an external help page
   */
  helpUrl?: string | { url: string; linkText: string; title: string };
  /**
   * as an alternative an help text shown as pop up
   */
  helpText?: string;
  /**
   * a tour id to start a tour
   */
  helpTourId?: string;
  /**
   * optional help text when the user is not allowed to see this view, if false (default) the view won't be shown, if a text or true it will be just greyed out
   * @default false
   */
  securityNotAllowedText?: string | boolean;
}

export interface IServerColumn {
  /**
   * column name to access with the data
   */
  column: string;
  /**
   * label of this column by default the column name
   */
  label: string;
  /**
   * column type
   */
  type: 'categorical' | 'number' | 'string';

  /**
   * the categories in case of type=categorical
   * Compliant with https://github.com/lineupjs/lineupjs/blob/fad387fc892753ca819ea1a6b21b6568891c806e/src/model/ICategoricalColumn.ts#L7
   */
  categories?: (string | Partial<ICategory>)[];

  /**
   * the minimal value in case of type=number
   */
  min?: number;

  /**
   * the maxmial value in case of type=number
   */
  max?: number;
}

export interface IArticle {
  title?: string;
  version: string;
  author: string;
  content: any;
  date: Date;
  tags: string[];
}
