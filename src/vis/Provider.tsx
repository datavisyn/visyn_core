import * as React from 'react';
import { BaseVisConfig, ICommonVisProps, ICommonVisSideBarProps, VisColumn } from './interfaces';

/**
 * The general visualization interface. Holds the type and the renderers.
 */
export interface GeneralVis<T extends BaseVisConfig = BaseVisConfig> {
  type: string;
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element;
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element;
  mergeConfig: (columns: VisColumn[], config: T) => T;
  description: string;
}

/**
 * Generic utility function for creating a vis object.
 */
export function createVis<T extends BaseVisConfig>({
  type,
  renderer,
  sidebarRenderer,
  mergeConfig,
  description = '',
}: {
  type: string;

  /** The main vis renderer. Required in all visualizations. */
  renderer: (props: ICommonVisProps<T>) => React.JSX.Element;

  /** The sidebar renderer. Required in all visualizations. */
  sidebarRenderer: (props: ICommonVisSideBarProps<T>) => React.JSX.Element;

  mergeConfig: (columns: VisColumn[], config: T) => T;

  description: string;
}): GeneralVis<T> {
  return {
    type,
    renderer,
    sidebarRenderer,
    mergeConfig,
    description,
  };
}

export const VisProviderContext = React.createContext<{
  visTypes: GeneralVis[];
  getVisByType: (type: string) => GeneralVis | null;
  registerVisType: (...visType: GeneralVis[]) => void;
}>({
  visTypes: [],
  getVisByType: () => null,
  registerVisType: () => {},
});

// Internal, only used by EagerVis
export function VisProvider({ children }: { children: React.ReactNode }) {
  const [visTypes, setVisTypes] = React.useState<GeneralVis[]>([]);

  const registerVisType = React.useCallback((...visType: GeneralVis[]) => {
    setVisTypes((prevVisTypes) => {
      const toAdd = visType.filter((conf) => !prevVisTypes.find((e) => e.type === conf.type));
      if (toAdd.length === 0) {
        return prevVisTypes;
      }
      return [...prevVisTypes, ...toAdd];
    });
  }, []);

  const getVisByType = React.useCallback(
    (type: string) => {
      return visTypes.find((visType) => visType.type === type);
    },
    [visTypes],
  );

  const visContextValue = React.useMemo(() => ({ visTypes, registerVisType, getVisByType }), [visTypes, registerVisType, getVisByType]);

  return <VisProviderContext.Provider value={visContextValue}>{children}</VisProviderContext.Provider>;
}

// Rather private, used by internal vis
export function useVisProvider() {
  const context = React.useContext(VisProviderContext);
  if (!context) {
    throw Error('Vis can only be used as child of VisynAppProvider.');
  }
  return context;
}
