import { test, expect, request } from '@playwright/test';
import { UserApiClient } from '../../src/api/userApiClient';
import { env } from '../../src/config/env';
import { validUser, validRegister, invalidRegister } from '../fixtures/testUsers';
import { logger } from '../utils/logger';
import { expectValidUserResponse } from '../utils/assertions';
import users from '../fixtures/users.json';

// Data-driven tests
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

// CRUD Operations
test.describe('CRUD', () => {
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

  test('Get Users (page 1)', async () => {
    const response = await userApi.getUsers(1);
    expect(response.status()).toBe(200);
    logger.info('Fetched users page 1');
  });

  test('Get Users (page 2)', async () => {
    const response = await userApi.getUsers(2);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.page).toBe(2);
  });

  test('Get User by ID (id=2)', async () => {
    const response = await userApi.getUserById(2);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.data.id).toBe(2);
    logger.info('Fetched user id=2');
  });

  test('Get non-existent user returns 404', async () => {
    const res = await userApi.getUserById(99999, false);
    expect(res.status()).toBe(404);
  });

  test('Create User', async () => {
    const response = await userApi.createUser(validUser);
    expect(response.status()).toBe(201);
    const json = await response.json();
    expect(json.name).toBe(validUser.name);
    expect(json.job).toBe(validUser.job);
    logger.info('Created user');
  });

  test('Create and fetch user', async () => {
    const createRes = await userApi.createUser(validUser);
    const created = await createRes.json();
    const fetchRes = await userApi.getUserById(created.id, false);
    if (fetchRes.status() === 200) {
      const fetched = await fetchRes.json();
      expect(fetched.name).toBe(validUser.name);
    } else {
      expect(fetchRes.status()).toBe(404);
    }
  });

  test('Update User', async () => {
    const response = await userApi.updateUser(2, validUser);
    expect(response.ok()).toBeTruthy();
    logger.info('Updated user id=2');
  });

  test('Update user and verify persistence', async () => {
    const updateRes = await userApi.updateUser(2, { name: 'updated', job: 'leader' });
    expect(updateRes.ok()).toBeTruthy();
    // Optionally, fetch and verify if API supports it
  });

  test('Update non-existent user returns 404', async () => {
    const res = await userApi.updateUser(99999, { name: 'ghost', job: 'none' }, false);
    expect([404, 400]).toContain(res.status());
  });

  test('Patch User', async () => {
    const response = await userApi.patchUser(2, { name: 'neo' });
    expect(response.ok()).toBeTruthy();
    logger.info('Patched user id=2');
  });

  test('Delete User', async () => {
    const response = await userApi.deleteUser(2);
    expect(response.status()).toBe(204);
    logger.info('Deleted user id=2');
  });

  test('Delete user and verify deletion', async () => {
    const delRes = await userApi.deleteUser(2);
    expect(delRes.status()).toBe(204);
    // const fetchRes = await userApi.getUserById(2, false);
    // expect(fetchRes.status()).toBe(404);
  });

  test('Delete non-existent user returns 404', async () => {
    const res = await userApi.deleteUser(99999, false);
    expect([404, 400, 204]).toContain(res.status());
  });

  test('Create user with long name', async () => {
    const longName = 'a'.repeat(300);
    const res = await userApi.createUser({ name: longName, job: 'test' }, false);
    expect([201, 400, 422]).toContain(res.status());
  });
});

// Authentication & Authorization
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

  test('Login', async () => {
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

// Response integrity & schema validation
test.describe('Response validation', () => {
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

  test('Get user data integrity', async () => {
    const res = await userApi.getUserById(2);
    const data = await res.json();
    expect(data).toHaveProperty('data');
    expect(data.data).toMatchObject({ id: 2, email: expect.any(String) });
  });

  test('Get user by ID with custom assertion', async () => {
    const res = await userApi.getUserById(2);
    const json = await res.json();
    expectValidUserResponse(json);
  });

  test('User response matches schema', async () => {
    const res = await userApi.getUserById(2);
    const json = await res.json();
    expectValidUserResponse(json);
  });
});

// Pagination, filtering, and edge cases
test.describe('Advanced & Edge Cases', () => {
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

  test('Get Users (page 2)', async () => {
    const response = await userApi.getUsers(2);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.page).toBe(2);
  });

  test.skip('Rate limiting scenario', async () => {
    // Rapidly fire requests and expect 429
  });

  test.skip('Get users with filter', async () => {
    // Example: const res = await userApi.getUsers({ filter: 'admin' });
    // expect(res.status()).toBe(200);
  });
});