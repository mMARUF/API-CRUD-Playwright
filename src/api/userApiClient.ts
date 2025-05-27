import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CreateUserRequest,
  UpdateUserRequest,
  RegisterRequest,
} from '../models/user';

export class UserApiClient {
  constructor(private request: APIRequestContext, private baseUrl: string) {}

  private async handleResponse(response: APIResponse, throwOnError = true) {
    if (throwOnError && !response.ok()) {
      const errorBody = await response.text();
      throw new Error(`API Error ${response.status()}: ${errorBody}`);
    }
    return response;
  }

  async getUsers(page = 1, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.get(`${this.baseUrl}/users?page=${page}`);
    return this.handleResponse(response, throwOnError);
  }

  async getUserById(id: number, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.get(`${this.baseUrl}/users/${id}`);
    return this.handleResponse(response, throwOnError);
  }

  async createUser(data: CreateUserRequest, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.post(`${this.baseUrl}/users`, { data });
    return this.handleResponse(response, throwOnError);
  }

  async updateUser(id: number, data: UpdateUserRequest, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.put(`${this.baseUrl}/users/${id}`, { data });
    return this.handleResponse(response, throwOnError);
  }

  async patchUser(id: number, data: Partial<UpdateUserRequest>, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.patch(`${this.baseUrl}/users/${id}`, { data });
    return this.handleResponse(response, throwOnError);
  }

  async deleteUser(id: number, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.delete(`${this.baseUrl}/users/${id}`);
    return this.handleResponse(response, throwOnError);
  }

  async register(data: RegisterRequest, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.post(`${this.baseUrl}/register`, { data });
    return this.handleResponse(response, throwOnError);
  }

  async login(data: RegisterRequest, throwOnError = true): Promise<APIResponse> {
    const response = await this.request.post(`${this.baseUrl}/login`, { data });
    return this.handleResponse(response, throwOnError);
  }
}