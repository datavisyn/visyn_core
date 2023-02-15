import React from 'react';
import { UserSession } from '../security/UserSession';
import { GlobalEventHandler } from '../base/event';
export function useVisynUser() {
    const [user, setUser] = React.useState(UserSession.getInstance().currentUser());
    React.useEffect(() => {
        const loginListener = (_, u) => {
            setUser(u);
        };
        const logoutListener = () => {
            setUser(null);
        };
        GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, loginListener);
        GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, logoutListener);
        return () => {
            GlobalEventHandler.getInstance().off(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, loginListener);
            GlobalEventHandler.getInstance().off(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, logoutListener);
        };
    }, []);
    return user;
}
//# sourceMappingURL=useVisynUser.js.map