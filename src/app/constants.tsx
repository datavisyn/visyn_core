import { MantineProviderProps } from '@mantine/core';

export const DEFAULT_MANTINE_PROVIDER_PROPS: Omit<MantineProviderProps, 'children'> = {
  withNormalizeCSS: false,
  withGlobalStyles: false,
  theme: {
    fontFamily: 'Roboto, sans-serif',
    colors: {
      dvGray: ['#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#495057', '#343A40', '#212529', '#1A1B1D'],
      white: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      primary: ['#E6F3FF', '#A8D7FF', '#79BCF5', '#54A5EB', '#3A8DD5', '#337AB7', '#206198', '#1C4F7B', '#053661', '#062C4E'],
    },
    primaryShade: 5,
    primaryColor: 'primary',
  },
};
