import { MantineProviderProps } from '@mantine/core';

export const DEFAULT_MANTINE_PROVIDER_PROPS: Omit<MantineProviderProps, 'children'> = {
  withNormalizeCSS: true,
  withCSSVariables: true,
  withGlobalStyles: true,
  theme: {
    fontFamily: 'Roboto, sans-serif',
    headings: {
      fontFamily: 'Roboto, sans-serif',
    },
    colors: {
      dvGray: ['#E9ECEF', '#DEE2E6', '#C8CED3', '#BCC3C9', '#ACB4BC', '#99A1A9', '#878E95', '#71787E', '#62686F', '#505459'],
      dvPrimary: ['#E6F3FF', '#A8D7FF', '#79BCF5', '#54A5EB', '#3A8DD5', '#337AB7', '#206198', '#1C4F7B', '#053661', '#062C4E'],
      white: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      dvDrug: ['#FBE3ED', '#F5C7D9', '#EEACC6', '#E78FB3', '#E074A1', '#B42865', '#9E1D58', '#87184D', '#6F1340', '#560D34'],
      dvGene: ['#EDF8F1', '#BDEDCA', '#9EE4B2', '#7DD997', '#5DCD7D', '#4BB268', '#439E5E', '#3B894F', '#32743F', '#285F30'],
      dvDisease: ['#FFF0E6', '#FFE1CC', '#FFD2B3', '#FFC399', '#FFB480', '#FF964D', '#E88745', '#CC783D', '#B36A35', '#995D2E'],
      dvCellLine: ['#EDF8F8', '#C6E8E8', '#9FD7D7', '#78C6C6', '#51B5B5', '#75C4C2', '#5BA3A1', '#427F7E', '#3A6A6A', '#1D4847'],
      dvTissue: ['#FFF1F0', '#FFE1DD', '#FFD0CA', '#FFBFA7', '#FFAF94', '#E57C73', '#C65A51', '#A63930', '#872617', '#650D00'],
    },
    primaryShade: 5,
    primaryColor: 'dvPrimary',
  },
};
