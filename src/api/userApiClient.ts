import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CreateUserRequest,
  UpdateUserRequest,
  RegisterRequest,
} from '../models/user';

export class UserApiClient {
  constructor(private request: APIRequestContext, private baseUrl: string) {}

  async getUsers(page = 1): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users?page=${page}`);
  }

  async getUserById(id: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/users`, { data });
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/users/${id}`, { data });
  }

  async patchUser(id: number, data: Partial<UpdateUserRequest>): Promise<APIResponse> {
    return this.request.patch(`${this.baseUrl}/users/${id}`, { data });
  }

  async deleteUser(id: number): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/users/${id}`);
  }

  async register(data: RegisterRequest): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/register`, { data });
  }

  async login(data: RegisterRequest): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/login`, { data });
  }
}