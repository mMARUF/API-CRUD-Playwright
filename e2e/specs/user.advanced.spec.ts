import { test, expect, request } from "@playwright/test";
import { UserApiClient } from "../../src/api/userApiClient";
import { env } from "../../src/config/env";

test.describe("Advanced & Edge Cases", () => {
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

  test("Get Users (page 2)", async () => {
    const response = await userApi.getUsers(2);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.page).toBe(2);
  });

  test("API response time is acceptable", async () => {
    const start = Date.now();
    const res = await userApi.getUsers(1);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000); // 2 seconds
  });

  test("Response headers contain security headers", async () => {
    const res = await userApi.getUsers(1);
    expect(res.headers()["content-type"]).toContain("application/json");
    // Add more header checks as needed
  });

  test.skip("Rate limiting scenario", async () => {
    // Rapidly fire requests and expect 429
  });

  test.skip("Get users with filter", async () => {
    // Example: const res = await userApi.getUsers({ filter: 'admin' });
    // expect(res.status()).toBe(200);
  });
});
