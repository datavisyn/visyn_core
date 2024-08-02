import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ request }) => {
  await request.post('/api/login', {
    form: {
      username: 'admin',
      password: 'admin',
    },
  });
  await request.storageState({ path: authFile });
});
