import { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type ExtendedCustomColors = 'dvPrimary' | 'dvGray' | 'dvGene' | 'dvDisease' | 'dvCellLine' | 'dvTissue' | 'dvDrug' | 'white' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
