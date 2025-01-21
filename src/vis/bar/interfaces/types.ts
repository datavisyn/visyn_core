import type { VisCategoricalValue, VisColumn, VisNumericalValue } from '../../interfaces';

export type VisColumnWithResolvedValues = VisColumn & { resolvedValues: (VisNumericalValue | VisCategoricalValue)[] };
