import type { VisColumn, VisNumericalValue, VisCategoricalValue } from '../../interfaces';

export type VisColumnWithResolvedValues = VisColumn & { resolvedValues: (VisNumericalValue | VisCategoricalValue)[] };
