import { ActionIcon, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import React, { useState } from 'react';
import { I18nextManager } from '../../i18n/I18nextManager';

export function VisynLoginForm({ onLogin }: { onLogin: (username: string, password: string) => Promise<void> }) {
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
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
