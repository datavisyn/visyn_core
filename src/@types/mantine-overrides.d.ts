declare module '@mantine/core' {
  import { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

  type ExtendedCustomColors = 'dvPrimary' | 'dvGray' | 'dvGene' | 'dvDisease' | 'dvCellLine' | 'dvTissue' | 'dvDrug' | 'white' | DefaultMantineColor;
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
