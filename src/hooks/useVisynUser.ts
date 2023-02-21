import React from 'react';
import { UserSession } from '../security/UserSession';
import { globalEventHandler } from '../base/event';
import { IUser, userSession } from '../security';

export function useVisynUser(): IUser | null {
  const [user, setUser] = React.useState<IUser | null>(userSession.currentUser());

  React.useEffect(() => {
    const loginListener = (_, u) => {
      setUser(u);
    };

    const logoutListener = () => {
      setUser(null);
    };

    globalEventHandler.on(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, loginListener);
    globalEventHandler.on(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, logoutListener);

    return () => {
      globalEventHandler.off(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, loginListener);
      globalEventHandler.off(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, logoutListener);
    };
  }, []);

  return user;
}
