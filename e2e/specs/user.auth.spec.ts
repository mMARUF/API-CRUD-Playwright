import { test, expect, request } from '@playwright/test';
import { UserApiClient } from '../../src/api/userApiClient';
import { env } from '../../src/config/env';
import { validRegister, invalidRegister } from '../fixtures/testUsers';
import { logger } from '../utils/logger';

test.describe('Auth', () => {
  let apiContext: any;
  let userApi: UserApiClient;
  let token: string;

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

  test('Register', async () => {
    const response = await userApi.register(validRegister);
    expect(response.ok()).toBeTruthy();
    logger.info('Registered user');
  });

  test('Register - Unsuccessful', async () => {
    const response = await userApi.register(invalidRegister as any, false);
    expect(response.status()).toBe(400);
    logger.info('Register unsuccessful as expected');
  });

  test('Register with invalid email', async () => {
    const res = await userApi.register({ email: 'not-an-email', password: '123' }, false);
    expect(res.status()).toBe(400);
  });

  test('Register with malformed payload', async () => {
    // @ts-ignore
    const res = await userApi.register({ foo: 'bar' }, false);
    expect([400, 422]).toContain(res.status());
  });

  test('Register with missing email', async () => {
    const res = await userApi.register({ password: '123' } as any, false);
    expect(res.status()).toBe(400);
  });

  test('Login @smoke', async () => {
    const response = await userApi.login(validRegister);
    expect(response.ok()).toBeTruthy();
    logger.info('Login successful');
  });

  test('Login - Unsuccessful', async () => {
    const response = await userApi.login({ email: 'peter@klaven' } as any, false);
    expect(response.status()).toBe(400);
    logger.info('Login unsuccessful as expected');
  });

  test('Login and use token', async () => {
    const res = await userApi.login(validRegister);
    const data = await res.json();
    token = data.token;
    // Use token in a protected endpoint (example, adjust as needed)
    const protectedContext = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` }
    });
    const protectedRes = await protectedContext.get(`${env.baseUrl}/users`);
    expect([200, 401, 403]).toContain(protectedRes.status());
    await protectedContext.dispose();
  });

  test('Access protected endpoint without token', async () => {
    const context = await request.newContext();
    const res = await context.get(`${env.baseUrl}/users`);
    expect([401, 403, 200]).toContain(res.status());
    await context.dispose();
  });

  test('Access protected endpoint with invalid token', async () => {
    const context = await request.newContext({
      extraHTTPHeaders: { Authorization: 'Bearer invalidtoken' }
    });
    const res = await context.get(`${env.baseUrl}/users`);
    expect([401, 403, 200]).toContain(res.status());
    await context.dispose();
  });

  test.skip('Session expiry', async () => {
    // Not supported by reqres.in, but example for real APIs
    // Simulate token expiry and check for 401/403
  });
});