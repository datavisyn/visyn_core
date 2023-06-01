import * as React from 'react';
import LineUp, { builder, buildRanking, Taggle, Ranking, DataBuilder, LocalDataProvider } from 'lineupjs';
import isEqual from 'lodash/isEqual';
import { Box, BoxProps } from '@mantine/core';
import { useSyncedRef } from '../hooks/useSyncedRef';
import { createFromDescRefWithScoreColumns, createScoreColumn, createToDescRefWithScoreColumns, IScoreResult } from './score/interfaces';
import { registerSMILESColumn } from './smiles/utils';

import '../scss/vendors/_lineup.scss';

export const defaultBuilder = ({
  data,
  smilesOptions = { setDynamicHeight: false },
}: {
  data: Record<string, unknown>[];
  smilesOptions?: Parameters<typeof registerSMILESColumn>[1];
}) => {
  const b = builder(data).deriveColumns().animated(true);
  registerSMILESColumn(b, smilesOptions);
  const rankingBuilder = buildRanking();
  rankingBuilder.supportTypes();
  rankingBuilder.allColumns();
  b.ranking(rankingBuilder);
  b.aggregationStrategy('group+item+top').propagateAggregationState(true).livePreviews({}).sidePanel(true, true);
  return b;
};

/**
 * Lineup information passed to user via onBuiltLineUp. This is useful for adding custom/score columns to the ranking.
 * Can store the createScoreColumn function in a ref and call it later to add a score column to the ranking.
 *
 * Such as in the following example:
 *
 *  const createScoreColumnFunc = React.useRef<(func: (data: { data: any }) => Promise<IScoreResult>) => Promise<void>>();
 *  const onBuiltLineUp = React.useCallback((props: IBuiltVisynRanking) => {
 *   createScoreColumnFunc.current = props.createScoreColumn;
 *  }, []);
 *
 *  React.useEffect(() => {
 *    if (createScoreColumnFunc.current) {
 *      createScoreColumnFunc.current(async ({ data }) => {
 *        const desc = await yourFunctionToGetDescription();
 *       return desc;
 *     });
 *    }
 *  }, [createScoreColumnFunc, yourFunctionToGetDescription]);
 *
 */
export interface IBuiltVisynRanking {
  provider: LocalDataProvider;
  ranking: Ranking;
  lineup: Taggle;
  createScoreColumn: (functionToCall: ({ data }: { data }) => Promise<IScoreResult>) => Promise<void>;
}

export function EagerVisynRanking<T extends Record<string, unknown>>({
  data,
  getBuilder = defaultBuilder,
  setSelection,
  selection,
  onBuiltLineUp,
  ...innerProps
}: {
  data: T[];
  getBuilder?: (props: { data: Record<string, unknown>[] }) => DataBuilder;
  setSelection: (selection: T[]) => void;
  selection: T[];
  onBuiltLineUp?: (props: IBuiltVisynRanking) => void;
} & BoxProps) {
  const divRef = React.useRef<HTMLDivElement>(null);
  const lineupRef = React.useRef<Taggle | null>(null);
  const rankingRef = React.useRef<Ranking | null>(null);
  const indexMapRef = React.useRef<Map<T, number> | null>(null);
  const disableLineUpSelectionListener = React.useRef<boolean>(false);

  const setSelectionRef = useSyncedRef(setSelection);
  const getBuilderRef = useSyncedRef(getBuilder);
  const onBuiltLineupRef = useSyncedRef(onBuiltLineUp);

  React.useEffect(() => {
    lineupRef.current?.destroy();

    const b = getBuilderRef.current({ data });

    // Build the ranking
    lineupRef.current = b.buildTaggle(divRef.current);

    // Listen to selections
    lineupRef.current.on(LineUp.EVENT_SELECTION_CHANGED, async () => {
      if (!disableLineUpSelectionListener.current) {
        const selected = await lineupRef.current.data.view(lineupRef.current.getSelection());
        setSelectionRef.current?.(selected);
      }
    });

    rankingRef.current = lineupRef.current.data.getRankings()?.[0];

    // Store a lookup map for fast selection restoration
    indexMapRef.current = data.reduce((acc, cur, i) => {
      acc.set(cur, i);
      return acc;
    }, new Map());

    const provider = lineupRef.current.data as LocalDataProvider;

    // Patch toDescRef/fromDescRef for score columns
    provider.toDescRef = createToDescRefWithScoreColumns(provider.toDescRef.bind(provider));
    provider.fromDescRef = createFromDescRefWithScoreColumns(provider.fromDescRef.bind(provider));

    onBuiltLineupRef.current?.({
      provider,
      ranking: rankingRef.current,
      lineup: lineupRef.current,
      createScoreColumn: async (functionToCall: ({ data }: { data }) => Promise<IScoreResult>) => {
        const desc = await functionToCall({ data });
        createScoreColumn(desc, lineupRef.current, rankingRef.current);
      },
    });

    return () => {
      lineupRef.current?.destroy();
    };
  }, [setSelectionRef, getBuilderRef, data, onBuiltLineupRef]);

  React.useEffect(() => {
    // Sync the selection back to lineup
    if (lineupRef.current && rankingRef.current && indexMapRef.current) {
      disableLineUpSelectionListener.current = true;
      const selectedIndices = selection?.map((s) => indexMapRef.current.get(s)).filter((i) => i != null);
      if (!selectedIndices) {
        lineupRef.current.setSelection([]);
      } else if (!isEqual(selectedIndices, lineupRef.current.getSelection())) {
        lineupRef.current.setSelection(selectedIndices);
      }
      disableLineUpSelectionListener.current = false;
    }
  }, [selection]);

  return (
    <Box
      ref={divRef}
      sx={{
        flex: 1,
        width: '100%',
        display: 'block',
        // Make the side panel scrollable
        '.lu-side-panel-main': {
          // Probably should move to _ranking.scss?
          flexBasis: 0,
          overflowY: 'auto',
        },
      }}
      {...(innerProps || {})}
    />
  );
}
