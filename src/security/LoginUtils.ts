import { userSession } from './UserSession';
import { IUser, IUserStore } from './interfaces';
import { Ajax } from '../base/ajax';

export class LoginUtils {
  /**
   * try to login the given user
   * @param {string} username username
   * @param {string} password password
   * @param {boolean} remember whether to set a long term cookie
   * @return {Promise<never | any>} the result in case of a reject it was an invalid request
   */
  static login(username: string, password: string) {
    userSession.reset();
    const r = Ajax.send('/api/login', { username, password }, 'post').then((user) => {
      userSession.login(user);
      return user;
    });
    // separate for multiple catch clauses
    r.catch(() => {
      userSession.logout({
        msg: 'Error logging in.',
      });
    });
    return r;
  }

  /**
   * logs the user out
   * @return {Promise<any>} when done also from the server side
   */
  static logout(): Promise<any> {
    return Ajax.send('/api/logout', {}, 'post')
      .then((r) => {
        userSession.logout(r);
      })
      .catch(() => {
        userSession.logout({
          msg: 'Error logging out via server. Logging out manually.',
        });
      });
  }

  static loggedInAs(): Promise<IUser> {
    return Ajax.send('/api/loggedinas', {}, 'POST');
  }

  static getStores(): Promise<IUserStore[]> {
    return Ajax.send('/api/security/stores', {}, 'GET');
  }
}
