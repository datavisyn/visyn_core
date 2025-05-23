import { abortAble } from 'lineupengine';
import {
  ERenderMode,
  ICellRenderer,
  ICellRendererFactory,
  IDataRow,
  IGroupCellRenderer,
  IOrderedGroup,
  IRenderContext,
  ISummaryRenderer,
  renderMissingDOM,
} from 'lineupjs';

import { SMILESColumn } from './SMILESColumn';

const template = '<div style="background-size: contain; background-position: center; background-repeat: no-repeat;"></div>';

function getImageURL(structure: string, substructure: string | null = null, align: string | null = null): string {
  return `/api/rdkit/?structure=${encodeURIComponent(structure)}${substructure ? `&substructure=${encodeURIComponent(substructure)}` : ''}${
    align ? `&align=${encodeURIComponent(align)}` : ''
  }`;
}

async function fetchImage({ url, data, method }: { url: string; data?: any; method?: string }): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    // mode: '*cors', // no-cors, *cors, same-origin
    method,
    redirect: 'follow',
    ...(data
      ? {
          body: JSON.stringify(data),
        }
      : {}),
  });
  if (!response.ok) {
    throw Error((await response.json().catch(() => null))?.message || response.statusText);
  }
  return response.text();
}

async function getReducedImages(structures: string[]): Promise<string | null> {
  // maximum common substructure
  if (structures.length > 2) {
    return fetchImage({ url: '/api/rdkit/mcs/', data: structures, method: 'POST' });
  }

  // similarity
  if (structures.length === 2) {
    const reference = structures[0]!;
    const probe = structures.length > 1 ? structures[1]! : structures[0]!;
    return fetchImage({ url: `/api/rdkit/similarity/?structure=${encodeURIComponent(probe)}&reference=${encodeURIComponent(reference)}`, method: 'GET' });
  }

  // single = first structure
  return fetchImage({ url: `/api/rdkit/?structure=${encodeURIComponent(structures[0]!)}`, method: 'GET' });
}

function svgToImageSrc(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function svgToCSSBackground(svg: string): string {
  return `url('${svgToImageSrc(svg)}')`;
}

export class SMILESRenderer implements ICellRendererFactory {
  readonly title: string = 'SMILES';

  canRender(col: SMILESColumn, mode: ERenderMode): boolean {
    return col instanceof SMILESColumn && (mode === ERenderMode.CELL || mode === ERenderMode.GROUP);
  }

  create(col: SMILESColumn): ICellRenderer {
    return {
      template,
      update: (n: HTMLLinkElement, d: IDataRow) => {
        if (!renderMissingDOM(n, col, d)) {
          if (d.v.images?.[0]) {
            n.style.backgroundImage = svgToCSSBackground(d.v.images[0]);
            return null;
          }
          const value = col?.getValue(d);
          // Load aysnc to avoid triggering
          return abortAble(
            new Promise((resolve) => {
              window.setTimeout(() => resolve(value), 500);
            }),
          ).then((image) => {
            if (!value || typeof image === 'symbol') {
              return;
            }
            n.style.backgroundImage = `url('${getImageURL(value, col.getFilter()?.filter, col.getAlign())}')`;
            n.title = value;
          });
        }
        return null;
      },
    };
  }

  createGroup(col: SMILESColumn, context: IRenderContext): IGroupCellRenderer {
    return {
      template,
      update: (n: HTMLImageElement, group: IOrderedGroup) => {
        context.tasks.groupRows(col, group, 'SMILESRendererGroup', (rows) => {
          return abortAble(getReducedImages(Array.from(rows.map((row) => col.getLabel(row))))).then((res: any) => {
            n.style.backgroundImage = res ? svgToCSSBackground(res) : '';
          });
        });
      },
    };
  }

  createSummary(): ISummaryRenderer {
    // no renderer
    return {
      template: `<div></div>`,
      update: () => {},
    };
  }
}
