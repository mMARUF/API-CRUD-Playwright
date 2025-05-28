export const validUser = {
  name: "morpheus",
  job: "leader",
};

export const validRegister = {
  email: "eve.holt@reqres.in",
  password: "pistol",
};

export const invalidRegister = {
  email: "sydney@fife",
};

export function userFactory(overrides = {}) {
  return {
    name: `user_${Math.random().toString(36).substring(2, 8)}`,
    job: "tester",
    ...overrides,
  };
}
