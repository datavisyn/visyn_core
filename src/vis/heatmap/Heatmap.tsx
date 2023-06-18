import * as React from 'react';
import { VisColumn, IScatterConfig } from '../interfaces';

export function Heatmap({ config, columns }: { config: IScatterConfig; columns: VisColumn[] }) {
  return <svg style={{ width: '100%', height: '100%' }} />;
}
