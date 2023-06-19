import * as React from 'react';
import { ICorrelationConfig, IVisConfig, VisColumn } from '../interfaces';

export function CorrelationMatrix({
  config,
  columns,
  setConfig,
}: {
  config: ICorrelationConfig;
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
}) {
  return (
    <div>
      <h1>Correlation Matrix</h1>
    </div>
  );
}
