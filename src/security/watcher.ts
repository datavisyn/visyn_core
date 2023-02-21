import { appContext } from '../base/AppContext';
import { userSession, UserSession } from './UserSession';
import { LoginUtils } from './LoginUtils';
import { Ajax } from '../base/ajax';
import { globalEventHandler } from '../base/event';

const DEFAULT_SESSION_TIMEOUT = 1 * 60 * 1000; // 1 min

export class SessionWatcher {
  private timeout = -1;

  private lastChecked = 0;

  constructor(private readonly logout: () => any = LoginUtils.logout) {
    globalEventHandler.on(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, () => this.reset());
    if (userSession.isLoggedIn()) {
      this.reset();
    }
    globalEventHandler.on(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, () => this.stop());
    globalEventHandler.on(Ajax.GLOBAL_EVENT_AJAX_POST_SEND, () => this.reset());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.start();
        this.checkSession();
      } else {
        this.pause();
      }
    });
  }

  private checkSession() {
    const now = Date.now();
    if (now - this.lastChecked < DEFAULT_SESSION_TIMEOUT) {
      // too early assume good
      return;
    }

    LoginUtils.loggedInAs()
      .then(() => this.reset())
      .catch(() => this.loggedOut());
  }

  private loggedOut() {
    if (!userSession.isLoggedIn()) {
      return;
    }

    // force log out
    this.logout();
  }

  private stop() {
    this.pause();
    this.lastChecked = 0;
  }

  private reset() {
    this.lastChecked = Date.now();
    this.start();
  }

  private pause() {
    if (this.timeout >= 0) {
      clearTimeout(this.timeout);
      this.timeout = -1;
    }
  }

  private start() {
    this.pause();
    if (userSession.isLoggedIn()) {
      this.timeout = window.setTimeout(() => this.checkSession(), DEFAULT_SESSION_TIMEOUT + 100);
    }
  }

  /**
   * watches for session auto log out scenarios
   */
  static startWatching(logout: () => any = LoginUtils.logout) {
    if (appContext.offline) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _ = new SessionWatcher(logout);
  }
}
