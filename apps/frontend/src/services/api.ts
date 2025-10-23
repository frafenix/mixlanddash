const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    // Per ora usiamo un token di test - in produzione questo dovrebbe venire dall'autenticazione
    const token = localStorage.getItem('auth_token') || 'test-token';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText || `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    return { data };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }
}

export const apiService = new ApiService();