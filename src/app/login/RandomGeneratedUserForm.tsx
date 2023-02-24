import { ActionIcon, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import React, { useState } from 'react';
import { appContext } from '../../base/index';
import { useAsync } from '../../hooks/useAsync';

function randomId(length = 8) {
  let id = '';
  while (id.length < length) {
    id += Math.random().toString(36).slice(-8);
  }
  return id.substring(0, length);
}

export function useGenerateRandomUser() {
  // generate random username
  const cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)randomCredentials\s*=\s*([^;]*).*$)|^.*$/, '$1');
  const getGeneratedUsername = (): Promise<string> => appContext.getAPIJSON('/tdp/security_store_generated/generated_username');
  const getUser = React.useMemo(
    () => async () => {
      let username: string;
      let password: string;
      if (cookieValue) {
        // restore old value
        [username, password] = cookieValue.split('@');
      } else {
        // request new username and generate new password
        username = await getGeneratedUsername();
        password = randomId(6);
      }
      return { username, password };
    },
    [cookieValue],
  );

  const { status, value: user } = useAsync(getUser, []);

  React.useEffect(() => {
    if (status === 'success') {
      // store for next time
      const maxAge = 2 * 7 * 24 * 60 * 60; // 2 weeks in seconds
      document.cookie = `randomCredentials=${user.username}@${user.password};max-age=${maxAge};SameSite=Strict`;
    }
  }, [status, user]);
  return { status, user };
}

export function RandomGeneratedUserForm({ onLogin }: { onLogin: (username: string, password: string) => Promise<void> }) {
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const { status, user } = useGenerateRandomUser();
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onLogin(values.username, values.password))}>
      <Stack>
        <TextInput placeholder="Username" label="Username" name="username" autoComplete="username" {...form.getInputProps('username')} required />
        <TextInput
          type={isShowPassword ? 'text' : 'password'}
          placeholder="Password"
          label="Password"
          name="password"
          autoComplete="current-password"
          {...form.getInputProps('password')}
          rightSection={
            <ActionIcon onClick={() => setIsShowPassword(!isShowPassword)}>
              {isShowPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </ActionIcon>
          }
          required
        />
      </Stack>
      <Group position="right">
        <Button fullWidth={false} mt="md" type="submit" className="btn btn-primary">
          Login
        </Button>
      </Group>
    </form>
  );
}
