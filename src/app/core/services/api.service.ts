import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { environment } from '../../../environments/environment';
import { useAuthStore } from '../../store/auth.store';

class ApiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: environment.apiUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: attach auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Use store logout to clear state properly, avoid full page reload
              useAuthStore.getState().logout();
              break;
            case 403:
              console.error('Forbidden: You do not have permission.');
              break;
            case 429:
              console.error('Too many requests. Please slow down.');
              break;
            case 500:
              console.error('Server error. Please try again later.');
              break;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(path: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(path, { params, ...config });
    return response.data;
  }

  async post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(path, body, config);
    return response.data;
  }

  async put<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(path, body, config);
    return response.data;
  }

  async patch<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(path, body, config);
    return response.data;
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(path, config);
    return response.data;
  }
}

export const apiService = new ApiService();
