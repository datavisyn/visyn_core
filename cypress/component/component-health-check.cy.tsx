import * as React from 'react';
import { MainApp } from '../../src/demo/MainApp';
import { VisynAppProvider } from '../../src/app';
// Load the phovea_registry to ensure all extension points (like locales) are loaded.
import '../../src/phovea_registry';

describe('Health check for Cypress component test', () => {
  it('should mount MainApp', () => {
    cy.mount(
      <VisynAppProvider appName="Demo App">
        <MainApp />
      </VisynAppProvider>,
    );
    cy.get('body').should('include.text', 'Demo App');
  });
});
