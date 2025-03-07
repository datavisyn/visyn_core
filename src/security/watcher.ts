import { LoginUtils } from './LoginUtils';
import { userSession } from './UserSession';
import { addVisynEventListener } from '../app/VisynEvents';
import { Ajax } from '../base/ajax';
import { globalEventHandler } from '../base/event';

const DEFAULT_SESSION_TIMEOUT = 1 * 60 * 1000; // 1 min

export class SessionWatcher {
  private timeout = -1;

  private hiddenTimeout = -1;

  private lastChecked = 0;

  constructor(private readonly logout: () => any = LoginUtils.logout) {
    addVisynEventListener('userLoggedIn', () => this.reset());
    if (userSession.isLoggedIn()) {
      this.reset();
    }
    addVisynEventListener('userLoggedOut', () => this.stop());
    // TODO: Remove legacy event handling
    globalEventHandler.on(Ajax.GLOBAL_EVENT_AJAX_POST_SEND, () => this.reset());
    document.addEventListener('visibilitychange', () => {
      window.clearInterval(this.hiddenTimeout);
      if (document.hidden) {
        this.pause();
        this.hiddenTimeout = window.setInterval(() => {
          // Check the session every now and then even when the window is not focused.
          this.checkSession();
        }, DEFAULT_SESSION_TIMEOUT * 10);
      } else {
        this.start();
        this.checkSession();
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

  public stop() {
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

  public start() {
    this.pause();
    if (userSession.isLoggedIn()) {
      this.timeout = window.setTimeout(() => this.checkSession(), DEFAULT_SESSION_TIMEOUT + 100);
    }
  }

  /**
   * watches for session auto log out scenarios
   */
  static startWatching(logout: () => any = LoginUtils.logout): SessionWatcher | null {
    return new SessionWatcher(logout);
  }
}
