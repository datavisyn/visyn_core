import * as React from 'react';

export interface IOnboardingContext {
  isVisSidebarOpen: boolean;
  setIsVisSidebarOpen: (open: boolean) => void;
  // selectedVisType: string;
  // setSelectedVisType: (type: string) => void;
  onboardingNodeToHighlight: string | null;
  setOnboardingNodeToHighlight: (node: string) => void;
}

export const OnboardingContext = React.createContext<IOnboardingContext>(null);

export function useOnboardingContext() {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw Error('Onboarding can only be used as child of OnboardingProvider.');
  }
  return context;
}
