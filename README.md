# API-CRUD-Test-Playwright

## Overview

This project is a professional-grade API testing framework built with [Playwright](https://playwright.dev/), TypeScript, and Azure DevOps CI/CD.  
It enables scalable, maintainable, and robust API testing for CRUD operations, authentication, data validation, and advanced scenarios.

---

## Quick Start Guide

### 1. **Clone the Repository**

```sh
git clone https://github.com/your-org/API-CRUD-Test-Playwright.git
cd API-CRUD-Test-Playwright
```

### 2. **Install Dependencies**

```sh
npm ci
```

### 3. **Configure Environment Variables**

Create a `.env` file in the root (optional, for custom API keys or base URLs):

```env
BASE_URL=https://reqres.in/api
API_KEY=reqres-free-v1
```

### 4. **Run All Tests**

```sh
npx playwright test
```

### 5. **Run Only Smoke Tests**

```sh
npx playwright test --grep @smoke
```

### 6. **Run Tests for a Specific Environment**

```sh
TEST_ENV=staging npx playwright test
```

---

## Framework Architecture

```ini
.
├── e2e/
│   ├── fixtures/         # Test data, factories, environment-specific data
│   │   ├── testUsers.ts              # Static/factory test data
│   │   ├── users.dev.json            # Dev environment test data
│   │   ├── users.staging.json        # Staging environment test data
│   │   └── users.prod.json           # Prod environment test data
│   │   └── envUsers.ts               # Loader for env-specific test data
│   ├── specs/            # Test suites (CRUD, Auth, Data-driven, etc.)
│   └── utils/            # Custom assertions, logger, retry, etc.
├── src/
│   ├── api/              # API client classes
│   ├── config/           # Environment config
│   └── models/           # TypeScript interfaces for API data
├── .azure-pipelines.yml  # Azure DevOps CI/CD pipeline
├── playwright.config.ts  # Playwright configuration
├── package.json
└── README.md
```

- **API Clients:** Encapsulate all API interactions with error handling and retry logic.
- **Fixtures:** Test data, factories, and environment-specific data sources.
- **Utils:** Logging, assertions, retry, and circuit breaker utilities.
- **Specs:** Organized by feature (CRUD, Auth, Validation, etc.) for maintainability.

---

## Test Data Strategy

- **Static/factory data:** Use `testUsers.ts` for reusable objects and data factories.
- **Environment-specific data:**
   - Use `users.dev.json`, `users.staging.json`, and `users.prod.json` for data-driven tests.
   - The loader `envUsers.ts` automatically loads the correct file based on the `TEST_ENV` environment variable.

- **No `users.json`:**
   - The generic `users.json` file is **not needed** and has been removed for clarity and to avoid confusion.

---

## Test Execution Instructions

- **Run all tests:**  
   `npx playwright test`
- **Run smoke tests only:**  
   `npx playwright test --grep @smoke`
- __Run tests for a specific environment:__  
   `TEST_ENV=prod npx playwright test`
- **View HTML report:**  
   `npx playwright show-report`

---

## CI/CD Pipeline Overview

- **Pipeline:** Defined in `.azure-pipelines.yml`
- **Stages:**
   - **Build:** Lint, format check, TypeScript compile, artifact publish
   - **Test:** Playwright test execution, result publishing
   - **Deploy:** Deploy to test/prod, run smoke tests, manual approval for prod

- **Quality Gates:**
   - Build fails on lint/compile errors
   - Test fails on any test failure
   - Deploy to prod only after manual approval and passing smoke tests

- **Environment-specific config:**
   - Use `TEST_ENV` variable and `/e2e/fixtures/envUsers.ts` for test data

- **Secrets management:**
   - Use Azure DevOps Library for API keys/tokens

---

## Troubleshooting

- **No tests found:**  
   Ensure your test files are in `/e2e/specs/` and named `*.spec.ts`.
- **JSON parse errors:**  
   Check that all files like `users.dev.json`, `users.staging.json`, and `users.prod.json` are valid JSON arrays.
- __Environment variable not set:__  
   Use `TEST_ENV=staging npx playwright test` to specify environment.
- **Permission errors on log file:**  
   Ensure you have write access to the project directory for `test.log`.
- **CI/CD pipeline failures:**  
   Check the Azure DevOps logs for details on which stage failed.

---

## Code Examples

### **API Client Usage**

```typescript
import { UserApiClient } from './src/api/userApiClient';
const userApi = new UserApiClient(request, baseUrl);

const response = await userApi.createUser({ name: 'neo', job: 'the one' });
expect(response.status()).toBe(201);
```

### **Data-Driven Test**

```typescript
import users from '../fixtures/envUsers';

users.forEach(user => {
  test(`Create user: ${user.name}`, async () => {
    const res = await userApi.createUser(user);
    expect(res.status()).toBe(201);
  });
});
```

### **Custom Assertion**

```typescript
import { expectValidUserResponse } from '../utils/assertions';

test('User response matches schema', async () => {
  const res = await userApi.getUserById(2);
  const json = await res.json();
  expectValidUserResponse(json);
});
```

---

## License

MIT

---

**For any issues or questions, please open an issue or contact the maintainers.**