// In case of failing tests due to i18next, check if the `esModuleInterop` flag is set to true in the jest config (in "tsConfig" object under "ts-jest" in globals property).
import i18next, { i18n as i18nType } from 'i18next';
import { pluginRegistry } from '../plugin/PluginRegistry';
import { EP_PHOVEA_CORE_LOCALE, ILocaleEPDesc } from '../plugin/extensions';

export class I18nextManager {
  public static DEFAULT_LANGUAGE = 'en';

  public static DEFAULT_NAMESPACE = 'default_namespace';

  /**
   * Create a unique i18next instance
   * Thus allowing the existence of multiple i18next instances with different configurations
   * without one overwriting the other
   */
  public i18n: i18nType = i18next.createInstance();

  /**
   *  Awaits the translation files registered at the EP_PHOVEA_CORE_LOCALE extension point
   *  Initialize I18next with the translation files
   */
  public initI18n = async () => {
    const plugins = await Promise.all(
      pluginRegistry.listPlugins(EP_PHOVEA_CORE_LOCALE).map((pluginDesc: ILocaleEPDesc) => {
        return pluginDesc.load().then((locale) => {
          return {
            lng: pluginDesc.lng || I18nextManager.DEFAULT_LANGUAGE,
            ns: pluginDesc.ns || I18nextManager.DEFAULT_NAMESPACE,
            resources: locale.factory(),
            order: pluginDesc.order || 0,
          };
        });
      }),
    );

    return this.i18n
      .use({
        type: 'postProcessor',
        name: 'showKeyDebugger',
        // @ts-ignore
        process: (value, key, option, translator) => (translator.options.debug ? key : value),
      })
      .init({
        debug: false,
        appendNamespaceToCIMode: true,
        interpolation: {
          escapeValue: true,
          format: (value, format) => {
            if (format === 'uppercase') {
              return value.toUpperCase();
            }
            if (format === 'lowercase') {
              return value.toLowerCase();
            }
            return value;
          },
        },
        ns: I18nextManager.DEFAULT_NAMESPACE,
        defaultNS: I18nextManager.DEFAULT_NAMESPACE,
        lng: I18nextManager.DEFAULT_LANGUAGE,
        fallbackLng: I18nextManager.DEFAULT_LANGUAGE,
        postProcess: ['showKeyDebugger'],
      })
      .then(() => {
        /* For each plugin add the resources to the i18next configuration
          If plugins have same language and namespace the  one with greater order
          overwrites the others
        */
        plugins
          .sort((pluginA, pluginB) => pluginA.order - pluginB.order)
          .forEach((plugin) => {
            this.i18n.addResourceBundle(plugin.lng, plugin.ns, plugin.resources, true, true);
          });
      });
  };

  /**
   * @deprecated Use `i18n` instead.
   */
  public static getInstance(): I18nextManager {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return i18nManager;
  }
}

export const i18nManager = new I18nextManager();
export const { i18n } = i18nManager;
