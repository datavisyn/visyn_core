import { AppContext } from '../base/AppContext';
import { UserSession } from './UserSession';
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
    UserSession.getInstance().reset();
    const r = Ajax.send('/login', { username, password }, 'post').then((user) => {
      UserSession.getInstance().login(user);
      return user;
    });
    // separate for multiple catch clauses
    r.catch(() => {
      UserSession.getInstance().logout({
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
    if (!AppContext.getInstance().offline) {
      return Ajax.send('/logout', {}, 'post')
        .then((r) => {
          UserSession.getInstance().logout(r);
        })
        .catch(() => {
          UserSession.getInstance().logout({
            msg: 'Error logging out via server. Logging out manually.',
          });
        });
    }
    UserSession.getInstance().logout({
      msg: 'Logging out in offline mode',
    });
    return Promise.resolve(true);
  }

  static loggedInAs(): Promise<IUser> {
    return Ajax.send('/loggedinas', {}, 'POST').then((user: string | IUser) => {
      if (typeof user !== 'string' && user.name) {
        return user;
      }
      return Promise.reject('invalid');
    });
  }

  static getStores(): Promise<IUserStore[]> {
    return Ajax.send('/api/security/stores', {}, 'GET');
  }
}
