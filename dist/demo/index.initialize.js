import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { VisynAppProvider } from '..';
import { MainApp } from './MainApp';
// create a new instance of the app
ReactDOM.render(React.createElement(VisynAppProvider, { appName: "Demo App" },
    React.createElement(MantineProvider, { withNormalizeCSS: true, withCSSVariables: true },
        React.createElement(MainApp, null))), document.getElementById('main'));
//# sourceMappingURL=index.initialize.js.map