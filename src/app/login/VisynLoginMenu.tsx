import React, { useState } from 'react';
import { Alert, Modal, Stack, Title, Center, Divider, Container, LoadingOverlay, Anchor } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons/faCircleExclamation';
import { userSession } from '../../security/UserSession';
import { LoginUtils } from '../../security/LoginUtils';
import { SessionWatcher } from '../../security/watcher';
import { useAsync } from '../../hooks/useAsync';
import { useVisynAppContext } from '../VisynAppContext';
import { DefaultLoginForm, UserStoreUIMap } from './UserStoreUIMap';

export function VisynLoginMenu({ watch = false }: { watch?: boolean }) {
  const { appName, user } = useVisynAppContext();
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (watch) {
      const watcher = SessionWatcher.startWatching(LoginUtils.logout);
      return () => {
        watcher.stop();
      };
    }
    return undefined;
  }, [watch]);

  React.useEffect(() => {
    if (user) {
      setShow(false);
    } else {
      const loginTimeout = setTimeout(() => {
        // Check if we are now logged in, if not, show the dialog.
        LoginUtils.loggedInAs()
          .then((u) => {
            userSession.login(u);
            setShow(false);
          })
          .catch(() => {
            setShow(true);
          });
      }, 500);

      return () => {
        clearTimeout(loginTimeout);
      };
    }
    return undefined;
  }, [user]);

  const { value: userStores, error: userStoreError, status: userStoreStatus, execute: retryGetStores } = useAsync(LoginUtils.getStores, []);
  const userStoresWithUI = userStores?.filter((store) => store.ui);
  const hasError = error && error !== 'not_reachable';
  const isOffline = error === 'not_reachable' || userStoreStatus === 'error';

  return (
    <Modal withCloseButton={false} opened={show} onClose={() => null} title={null} data-testid="visyn-login-modal">
      <Container fluid>
        <Stack mb="lg">
          <Center>
            <Title order={4}>Welcome to {appName}</Title>
          </Center>
          <Divider />
        </Stack>
      </Container>
      <Stack style={{ position: 'relative', minHeight: '5rem' }}>
        {isOffline ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} color="yellow" radius="md">
            The server seems to be offline!{' '}
            <Anchor
              component="button"
              type="button"
              onClick={() => {
                setError(null);
                retryGetStores();
              }}
            >
              Try again
            </Anchor>
            .
          </Alert>
        ) : null}
        {hasError ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} color="red" radius="md">
            {error}
          </Alert>
        ) : null}
        {userStoreStatus === 'pending' ? <LoadingOverlay visible /> : null}
        {!userStores || isOffline ? null : userStoresWithUI.length === 0 ? (
          // Use the dummy store as default if no store is found
          <DefaultLoginForm setError={setError} store={{ id: 'DummyStore', ui: 'DefaultLoginForm', configuration: {} }} />
        ) : (
          // Render all stores next to eachother
          userStoresWithUI.map((store, i, all) => {
            const ToRender = UserStoreUIMap.get(store.ui);

            return (
              <React.Fragment key={store.id}>
                {ToRender ? (
                  <ToRender key={store.id} setError={setError} store={store} />
                ) : (
                  <Alert color="yellow" radius="md">
                    No {store.ui} found for {store.id}. Contact the site administrator if this issue perists.
                  </Alert>
                )}
                {ToRender && i !== all.length - 1 ? <Divider label="Or" labelPosition="center" /> : null}
              </React.Fragment>
            );
          })
        )}
      </Stack>
    </Modal>
  );
}
