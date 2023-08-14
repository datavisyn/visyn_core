import type { BaseConfig, VisColumn } from '../../../vis/interfaces';
import { VisynSimpleViewPluginType } from '../interfaces';

export type DemoVisynViewPluginType = VisynSimpleViewPluginType<{
  columns: VisColumn[] | null;
  config: BaseConfig | null;
  dataLength: number;
}>;
