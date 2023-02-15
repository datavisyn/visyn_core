import type { IUser, ISecureItem } from './interfaces';
import { EPermission, EEntity } from './constants';
/**
 * Options of a logout action.
 */
export interface ILogoutOptions {
    /**
     * Logout message.
     */
    msg: string;
    /**
     * Optional payload of the alb_security_store.
     */
    alb_security_store?: {
        /**
         * Redirect URL for the client to actually logout.
         */
        redirect?: string;
    };
}
export declare class UserSession {
    static GLOBAL_EVENT_USER_LOGGED_IN: string;
    static GLOBAL_EVENT_USER_LOGGED_OUT: string;
    /**
     * Use the browser's sessionStorage
     * @type {Storage}
     */
    private context;
    /**
     * Store any value for a given key and returns the previous stored value.
     * Returns `null` if no previous value was found.
     * @param key
     * @param value
     * @returns {any}
     */
    store(key: string, value: any): string;
    /**
     * Returns the value for the given key if it exists in the session.
     * Otherwise returns the `default_` parameter, which is by default `null`.
     * @param key
     * @param defaultValue
     * @returns {T}
     */
    retrieve<T>(key: string, defaultValue?: T): T;
    /**
     * resets the stored session data that will be automatically filled during login
     */
    reset(): void;
    /**
     * whether the user is logged in
     * @returns {boolean}
     */
    isLoggedIn(): boolean;
    /**
     * stores the given user information
     * @param user
     */
    login(user: IUser): void;
    /**
     * logs the current user out
     */
    logout(options: ILogoutOptions): void;
    /**
     * returns the current user or null
     * @returns {any}
     */
    currentUser(): IUser | null;
    /**
     * returns the current user name else an anonymous user name
     */
    currentUserNameOrAnonymous(): string;
    can(item: ISecureItem, permission: EPermission, user?: IUser): boolean;
    /**
     * check whether the given user can read the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canRead(item: ISecureItem, user?: IUser): boolean;
    /**
     * check whether the given user can write the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canWrite(item: ISecureItem, user?: IUser): boolean;
    /**
     * check whether the given user can execute the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canExecute(item: ISecureItem, user?: IUser): boolean;
    hasPermission(item: ISecureItem, entity?: EEntity, permission?: EPermission): boolean;
    private isEqual;
    private includes;
    private static instance;
    static getInstance(): UserSession;
}
//# sourceMappingURL=UserSession.d.ts.map