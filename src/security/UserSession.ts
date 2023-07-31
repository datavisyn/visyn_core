import type { IUser, ISecureItem } from './interfaces';
import { globalEventHandler } from '../base/event';
import { pluginRegistry } from '../plugin/PluginRegistry';
import { ILoginExtensionPointDesc, ILogoutEP, ILogoutEPDesc, ILoginExtensionPoint, EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT } from '../plugin/extensions';
import { UserUtils, EPermission, EEntity } from './constants';
import { Permission } from './Permission';

/**
 * Options of a logout action.
 */
export interface ILogoutOptions {
  /**
   * Logout message.
   */
  msg: string;
  /**
   * Redirect URL for the client to actually logout.
   */
  redirect?: string;
}

export class UserSession {
  public static GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';

  public static GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';

  /**
   * Use the browser's sessionStorage
   * @type {Storage}
   */
  private context: Storage = window.sessionStorage;

  /**
   * Store any value for a given key and returns the previous stored value.
   * Returns `null` if no previous value was found.
   * @param key
   * @param value
   * @returns {any}
   */
  public store = (key: string, value: any) => {
    const bak = this.context.getItem(key);
    this.context.setItem(key, JSON.stringify(value));
    return bak;
  };

  /**
   * Returns the value for the given key if it exists in the session.
   * Otherwise returns the `default_` parameter, which is by default `null`.
   * @param key
   * @param defaultValue
   * @returns {T}
   */
  public retrieve = <T>(key: string, defaultValue: T = null): T => {
    return this.context.getItem(key) !== null ? JSON.parse(this.context.getItem(key)) : defaultValue;
  };

  /**
   * resets the stored session data that will be automatically filled during login
   */
  public reset = () => {
    this.context.removeItem('logged_in');
    this.context.removeItem('username');
    this.context.removeItem('user');
  };

  /**
   * whether the user is logged in
   * @returns {boolean}
   */
  public isLoggedIn = () => {
    return this.retrieve('logged_in') === true;
  };

  /**
   * stores the given user information
   * @param user
   */
  public login = (user: IUser) => {
    this.store('logged_in', true);
    this.store('username', user.name);
    this.store('user', user);

    pluginRegistry.listPlugins(EP_PHOVEA_CORE_LOGIN).forEach((desc: ILoginExtensionPointDesc) => {
      desc.load().then((plugin: ILoginExtensionPoint) => plugin.factory(user));
    });

    globalEventHandler.fire(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, user);
  };

  /**
   * logs the current user out
   */
  public logout = (options: ILogoutOptions) => {
    const wasLoggedIn = this.isLoggedIn();
    this.reset();
    if (wasLoggedIn) {
      pluginRegistry.listPlugins(EP_PHOVEA_CORE_LOGOUT).forEach((desc: ILogoutEPDesc) => {
        desc.load().then((plugin: ILogoutEP) => plugin.factory());
      });

      // Notify all listeners
      globalEventHandler.fire(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, options);

      // Handle different logout options
      // TODO: Maybe extract them to extension points later?
      if (options?.redirect) {
        window.location.href = options.redirect;
      }
    }
  };

  /**
   * returns the current user or null
   * @returns {any}
   */
  public currentUser = (): IUser | null => {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.retrieve('user', UserUtils.ANONYMOUS_USER);
  };

  /**
   * returns the current user name else an anonymous user name
   */
  public currentUserNameOrAnonymous = () => {
    const u = this.currentUser();
    return u ? u.name : UserUtils.ANONYMOUS_USER.name;
  };

  public can = (item: ISecureItem, permission: EPermission, user = this.currentUser()): boolean => {
    if (!user) {
      user = UserUtils.ANONYMOUS_USER;
    }
    const permissions = Permission.decode(item.permissions);

    // I'm the creator and have the right
    if (this.isEqual(user.name, item.creator) && permissions.user.has(permission)) {
      return true;
    }

    // check if I'm in the group and have the right
    if (item.group && this.includes(user.roles, item.group) && permissions.group.has(permission)) {
      return true;
    }

    // check if I'm a buddy having the right
    if (item.buddies && Array.isArray(item.buddies) && this.includes(item.buddies, user.name) && permissions.buddies.has(permission)) {
      return true;
    }

    // check others
    return permissions.others.has(permission);
  };

  /**
   * check whether the given user can read the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canRead = (item: ISecureItem, user = this.currentUser()) => {
    return this.can(item, EPermission.READ, user);
  };

  /**
   * check whether the given user can write the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canWrite = (item: ISecureItem, user = this.currentUser()) => {
    return this.can(item, EPermission.WRITE, user);
  };

  /**
   * check whether the given user can execute the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canExecute = (item: ISecureItem, user = this.currentUser()) => {
    return this.can(item, EPermission.EXECUTE, user);
  };

  public hasPermission(item: ISecureItem, entity: EEntity = EEntity.USER, permission: EPermission = EPermission.READ) {
    const permissions = Permission.decode(item.permissions);
    return permissions.hasPermission(entity, permission);
  }

  private isEqual = (a: string, b: string) => {
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a.localeCompare(b) === 0;
  };

  private includes = (items: string[], item: string) => {
    if (!item) {
      return false;
    }
    return items.some((r) => this.isEqual(item, r));
  };

  /**
   * @deprecated Use `userSession` instead.
   */
  public static getInstance(): UserSession {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return userSession;
  }
}

export const userSession = new UserSession();
