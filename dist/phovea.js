import { EP_PHOVEA_CORE_LOCALE, PluginRegistry } from './plugin';
export default function (registry) {
    registry.push(EP_PHOVEA_CORE_LOCALE, 'visynCoreLocaleEN', function () {
        return import('./locales/en/visyn.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'visyn',
    });
    /*
    registry.pushVisynView<DemoVisynViewPluginType>(
      'LazyVisynDemoView',
      () => import('./views/visyn/demo/LazyVisynDemoView').then((m) => m.createLazyVisynDemoView),
      {
        visynViewType: 'simple',
        selection: 'any',
        idtype: '.*',
        name: 'Vis Demo (Lazy)',
        description: 'Demo view showcasing Vis with randomly generated data',
        includeInDashboardView: true,
        group: {
          name: 'Demo',
          order: 99,
        },
      },
    );
  
    registry.pushVisynView<DemoVisynViewPluginType>('VisynDemoView', () => import('./views/visyn/demo/VisynDemoView').then((m) => m.createVisynDemoView), {
      visynViewType: 'simple',
      selection: 'any',
      idtype: '.*',
      name: 'Vis Demo',
      description: 'Demo view showcasing Vis with randomly generated data',
      includeInDashboardView: true,
      group: {
        name: 'Demo',
        order: 99,
      },
    });
    */
}
//# sourceMappingURL=phovea.js.map