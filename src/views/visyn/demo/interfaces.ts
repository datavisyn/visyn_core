import type { BaseVisConfig, VisColumn } from '../../../vis/interfaces';
import { VisynSimpleViewPluginType } from '../interfaces';

export type DemoVisynViewPluginType = VisynSimpleViewPluginType<{
  columns: VisColumn[] | null;
  config: BaseVisConfig | null;
  dataLength: number;
}>;
