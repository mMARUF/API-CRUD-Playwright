import { test, expect, request } from '@playwright/test';
import { z } from 'zod';

export const userSchema = z.object({
  data: z.object({
    id: z.number(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    avatar: z.string().url()
  })
});

export function expectValidUserResponse(json: any) {
  expect(json).toHaveProperty('data');
  userSchema.parse(json); // schema validation
  expect(json.data).toMatchObject({
    id: expect.any(Number),
    email: expect.any(String),
    first_name: expect.any(String),
    last_name: expect.any(String),
    avatar: expect.any(String),
  });
}

