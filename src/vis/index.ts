// Do not export any Vis as it will also export plotly, but we want to export the LazyVis instead.
// export * from './bar';
// export * from './hexbin';
// export * from './scatter';
// export * from './violin';
// export * from './Vis';
export * from './LazyVis';
export * from './LineupVisWrapper';
export * from './VisSidebar';
export * from './general';
export * from './interfaces';
export * from './sidebar';

// Export interfaces ONLY since else the lazy loading will break
export * from './barGood/interfaces';
export * from './correlation/interfaces';
