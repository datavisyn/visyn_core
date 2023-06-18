import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { table, op } from 'arquero';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IScatterConfig } from '../interfaces';
import { getScatterData } from './utils';
import { XAxis } from '../hexbin/XAxis';
import { YAxis } from '../hexbin/YAxis';

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};
export function Scatterplot({ config, columns }: { config: IScatterConfig; columns: VisColumn[] }) {
  return <svg style={{ width: '100%', height: '100%' }} />;
}
