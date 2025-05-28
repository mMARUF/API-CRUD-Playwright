import { test, expect, request } from '@playwright/test';
import { UserApiClient } from '../../src/api/userApiClient';
import { env } from '../../src/config/env';
import users from '../fixtures/envUsers';

test.describe('Data-driven user creation', () => {
  let apiContext: any;
  let userApi: UserApiClient;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': env.apiKey,
      },
    });
    userApi = new UserApiClient(apiContext, env.baseUrl);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  users.forEach(user => {
    test(`Create user: ${user.name}`, async () => {
      const res = await userApi.createUser(user);
      expect(res.status()).toBe(201);
      const json = await res.json();
      expect(json.name).toBe(user.name);
      expect(json.job).toBe(user.job);
    });
  });
});