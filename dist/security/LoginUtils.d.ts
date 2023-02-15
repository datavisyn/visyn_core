import { IUser, IUserStore } from './interfaces';
export declare class LoginUtils {
    /**
     * try to login the given user
     * @param {string} username username
     * @param {string} password password
     * @param {boolean} remember whether to set a long term cookie
     * @return {Promise<never | any>} the result in case of a reject it was an invalid request
     */
    static login(username: string, password: string): Promise<any>;
    /**
     * logs the user out
     * @return {Promise<any>} when done also from the server side
     */
    static logout(): Promise<any>;
    static loggedInAs(): Promise<IUser>;
    static getStores(): Promise<IUserStore[]>;
}
//# sourceMappingURL=LoginUtils.d.ts.map