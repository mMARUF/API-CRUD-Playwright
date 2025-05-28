import { test, expect, request } from "@playwright/test";
import { UserApiClient } from "../../src/api/userApiClient";
import { env } from "../../src/config/env";
import { expectValidUserResponse } from "../utils/assertions";

test.describe("Response validation", () => {
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

  test("Get user data integrity", async () => {
    const res = await userApi.getUserById(2);
    const data = await res.json();
    expect(data).toHaveProperty("data");
    expect(data.data).toMatchObject({ id: 2, email: expect.any(String) });
  });

  test("Get user by ID with custom assertion", async () => {
    const res = await userApi.getUserById(2);
    const json = await res.json();
    expectValidUserResponse(json);
  });

  test("User response matches schema", async () => {
    const res = await userApi.getUserById(2);
    const json = await res.json();
    expectValidUserResponse(json);
  });
});
