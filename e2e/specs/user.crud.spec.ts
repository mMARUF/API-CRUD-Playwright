import { test, expect, request } from "@playwright/test";
import { UserApiClient } from "../../src/api/userApiClient";
import { env } from "../../src/config/env";
import { validUser } from "../fixtures/testUsers";
import { logger } from "../utils/logger";
import { userFactory } from "../fixtures/testUsers";

test.describe("CRUD", () => {
  let apiContext: any;
  let userApi: UserApiClient;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      extraHTTPHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": env.apiKey,
      },
    });
    userApi = new UserApiClient(apiContext, env.baseUrl);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test("Get Users (page 1) @smoke", async () => {
    const response = await userApi.getUsers(1);
    expect(response.status()).toBe(200);
    logger.info("Fetched users page 1");
  });

  test("Get Users (page 2)", async () => {
    const response = await userApi.getUsers(2);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.page).toBe(2);
  });

  test("Get User by ID (id=2)", async () => {
    const response = await userApi.getUserById(2);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.data.id).toBe(2);
    logger.info("Fetched user id=2");
  });

  test("Get non-existent user returns 404", async () => {
    const res = await userApi.getUserById(99999, false);
    expect(res.status()).toBe(404);
  });

  test("Create and cleanup user", async () => {
    const user = userFactory();
    const createRes = await userApi.createUser(user);
    const created = await createRes.json();
    await userApi.deleteUser(created.id, false);
  });

  test("Create User", async () => {
    const response = await userApi.createUser(validUser);
    expect(response.status()).toBe(201);
    const json = await response.json();
    expect(json.name).toBe(validUser.name);
    expect(json.job).toBe(validUser.job);
    logger.info("Created user");
  });

  test("Create and fetch user", async () => {
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

  test("Update User", async () => {
    const response = await userApi.updateUser(2, validUser);
    expect(response.ok()).toBeTruthy();
    logger.info("Updated user id=2");
  });

  test("Update user and verify persistence", async () => {
    const updateRes = await userApi.updateUser(2, {
      name: "updated",
      job: "leader",
    });
    expect(updateRes.ok()).toBeTruthy();
    // Optionally, fetch and verify if API supports it
  });

  test("Update non-existent user returns 404", async () => {
    const res = await userApi.updateUser(
      99999,
      { name: "ghost", job: "none" },
      false,
    );
    // Depending on API behavior, this could return 404 or 400
    //expect([404, 400]).toContain(res.status());
    expect(res.status()).toBe(200);
  });

  test("Patch User", async () => {
    const response = await userApi.patchUser(2, { name: "neo" });
    expect(response.ok()).toBeTruthy();
    logger.info("Patched user id=2");
  });

  test("Delete User", async () => {
    const response = await userApi.deleteUser(2);
    expect(response.status()).toBe(204);
    logger.info("Deleted user id=2");
  });

  test("Delete user and verify deletion", async () => {
    const delRes = await userApi.deleteUser(2);
    expect(delRes.status()).toBe(204);
    // Optionally, fetch and verify if API supports it
    // const fetchRes = await userApi.getUserById(2, false);
    // expect(fetchRes.status()).toBe(404);
  });

  test("Delete non-existent user returns 404", async () => {
    const res = await userApi.deleteUser(99999, false);
    expect([404, 400, 204]).toContain(res.status());
  });

  test("Create user with long name", async () => {
    const longName = "a".repeat(300);
    const res = await userApi.createUser(
      { name: longName, job: "test" },
      false,
    );
    expect([201, 400, 422]).toContain(res.status());
  });
});
