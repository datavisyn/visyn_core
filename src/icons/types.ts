import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { type ActionIconProps } from '@mantine/core';
import { type LucideIcon } from 'lucide-react';

export type VisynIcon = React.FunctionComponent<VisynIconProps>;

export type VisynIconProps = {
  size?: VisynMantineSize;
};

export type VisynMantineSize = ActionIconProps['size'];

export type AgnosticIconDefinition = IconProp | LucideIcon | React.FunctionComponent<VisynIconProps>;
