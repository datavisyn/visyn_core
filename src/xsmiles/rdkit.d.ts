import type { RDKitModule } from '@rdkit/rdkit';

declare global {
  interface Window {
    RDKit: RDKitModule;
  }
}

export {};
