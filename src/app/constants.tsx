import type { MantineProviderProps } from '@mantine/core';

export const DEFAULT_MANTINE_PROVIDER_PROPS: Omit<MantineProviderProps, 'children'> = {
  theme: {
    fontFamily: 'Roboto, sans-serif',
    headings: {
      fontFamily: 'Roboto, sans-serif',
    },
    colors: {
      dvGray: ['#E9ECEF', '#DEE2E6', '#C8CED3', '#BCC3C9', '#ACB4BC', '#99A1A9', '#878E95', '#71787E', '#62686F', '#505459'],
      dvPrimary: ['#E6F3FF', '#A8D7FF', '#79BCF5', '#54A5EB', '#3A8DD5', '#337AB7', '#206198', '#1C4F7B', '#053661', '#062C4E'],
      dvAI: ['#F5EEFF', '#E3D8F8', '#C3B0EC', '#A284E0', '#865ED6', '#7446D0', '#6B3BCE', '#5A2EB6', '#5027A4', '#442091'],
      white: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      dvDrug: ['#FBE3ED', '#F5C7D9', '#EEACC6', '#E78FB3', '#E074A1', '#B42865', '#9E1D58', '#87184D', '#6F1340', '#560D34'],
      dvGene: ['#EDF8F1', '#BDEDCA', '#9EE4B2', '#7DD997', '#5DCD7D', '#4BB268', '#439E5E', '#3B894F', '#32743F', '#285F30'],
      dvDisease: ['#FFF0E6', '#FFE1CC', '#FFD2B3', '#FFC399', '#FFB480', '#FF964D', '#E88745', '#CC783D', '#B36A35', '#995D2E'],
      dvCellLine: ['#D9F4F3', '#B5E5E5', '#8FD7D6', '#6FCAC9', '#5BC2C1', '#39A2A1', '#2C9695', '#0B8281', '#087170', '#045B5B'],
      dvTissue: ['#FFF1F0', '#FFE1DD', '#FFD0CA', '#FFBFA7', '#FFAF94', '#E57C73', '#C65A51', '#A63930', '#872617', '#650D00'],
      dvProtein: ['#E0F9FF', '#CAECFF', '#98D6FF', '#62BFFF', '#36ABFE', '#199FFE', '#0099FF', '#0085E5', '#0076CE', '#0066B7'],
      dvPathway: ['#FFEDFD', '#F6DBF2', '#E8B9E2', '#D283C7', '#CA64BC', '#BF49AF', '#A83A99', '#97318A', '#842779', '#711366'],
    },
    primaryShade: 5,
    primaryColor: 'dvPrimary',
  },
};
