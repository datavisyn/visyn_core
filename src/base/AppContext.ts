import { Ajax } from './ajax';
import { WebpackEnv } from './WebpackEnv';

type OfflineGenerator = ((data: any, url: string) => Promise<any>) | Promise<any> | any;

export class AppContext {
  /**
   * whether the standard api calls should be prevented
   * @type {boolean}
   */
  public offline = false;

  public static context = WebpackEnv.__APP_CONTEXT__;

  /**
   * version of the core
   */
  public static version = WebpackEnv.__VERSION__;

  // eslint-disable @typescript-eslint/naming-convention disable
  /**
   * server prefix of api calls
   * @type {string}
   */
  public server_url = `${WebpackEnv.__APP_CONTEXT__ || '/'}api`;

  /**
   * server suffix for api calls
   * @type {string}
   */
  public server_json_suffix = '';
  // eslint-enable @typescript-eslint/naming-convention disable

  public isOffline() {
    return this.offline;
  }

  /**
   * converts the given api url to an absolute with optional get parameters
   * @param url
   * @param data
   * @returns {string}
   */
  public api2absURL(url: string, data: any = null) {
    url = `${this.server_url}${url}${this.server_json_suffix}`;
    data = Ajax.encodeParams(data);
    if (data) {
      url += (/\?/.test(url) ? '&' : '?') + data;
    }
    return url;
  }

  private defaultGenerator: OfflineGenerator = () => Promise.reject('offline');

  public setDefaultOfflineGenerator(generator: OfflineGenerator | null) {
    this.defaultGenerator = generator || (() => Promise.reject('offline'));
  }

  /**
   * handler in case phovea is set to be in offline mode
   * @param generator
   * @param data
   * @param url
   * @returns {Promise<OfflineGenerator>}
   */
  private sendOffline(generator: OfflineGenerator, url: string, data: any) {
    return Promise.resolve(typeof generator === 'function' ? generator(data, url) : generator);
  }

  /**
   * api version of send
   * @param url api relative url
   * @param data arguments
   * @param method http method
   * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
   * @param offlineGenerator in case phovea is set to be offline
   * @returns {Promise<any>}
   */
  public sendAPI(
    url: string,
    data: any = {},
    method = 'GET',
    expectedDataType = 'json',
    offlineGenerator: OfflineGenerator = this.defaultGenerator,
  ): Promise<any> {
    if (this.isOffline()) {
      return this.sendOffline(offlineGenerator, url, data);
    }
    return Ajax.send(this.api2absURL(url), data, method, expectedDataType);
  }

  /**
   * api version of getJSON
   * @param url api relative url
   * @param data arguments
   * @param offlineGenerator in case of offline flag is set what should be returned
   * @returns {Promise<any>}
   */
  public getAPIJSON(url: string, data: any = {}, offlineGenerator: OfflineGenerator = this.defaultGenerator): Promise<any> {
    if (this.isOffline()) {
      return this.sendOffline(offlineGenerator, url, data);
    }
    return Ajax.getJSON(this.api2absURL(url), data);
  }

  /**
   * api version of getData
   * @param url api relative url
   * @param data arguments
   * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
   * @param offlineGenerator in case of offline flag is set what should be returned
   * @returns {Promise<any>}
   */
  public getAPIData(url: string, data: any = {}, expectedDataType = 'json', offlineGenerator: OfflineGenerator = () => this.defaultGenerator): Promise<any> {
    if (this.isOffline()) {
      return this.sendOffline(offlineGenerator, url, data);
    }
    return Ajax.getData(this.api2absURL(url), data, expectedDataType);
  }

  /**
   * @deprecated Use `appContext` instead.
   */
  public static getInstance(): AppContext {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return appContext;
  }
}

export const appContext = new AppContext();
