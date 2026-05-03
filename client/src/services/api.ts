const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = this.getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async getAllUsers() {
    return this.request<any>('/auth/users');
  }

  logout() {
    this.setToken(null);
  }

  // Project endpoints
  async getProjects() {
    return this.request<any>('/projects');
  }

  async createProject(project: { name: string; description?: string; color?: string }) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: project,
    });
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async updateProject(id: string, project: { name?: string; description?: string; color?: string }) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: project,
    });
  }

  async deleteProject(id: string) {
    return this.request<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async addMember(projectId: string, email: string, role: string = 'member') {
    return this.request<any>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: { email, role },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return this.request<any>(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(projectId: string, userId: string, role: string) {
    return this.request<any>(`/projects/${projectId}/members/${userId}/role`, {
      method: 'PUT',
      body: { role },
    });
  }

  // Task endpoints
  async getProjectTasks(projectId: string) {
    return this.request<any>(`/tasks/projects/${projectId}/tasks`);
  }

  async createTask(projectId: string, task: any) {
    return this.request<any>(`/tasks/projects/${projectId}/tasks`, {
      method: 'POST',
      body: task,
    });
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  async updateTask(id: string, task: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: task,
    });
  }

  async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTaskStatus(id: string, status: string) {
    return this.request<any>(`/tasks/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }
}

export const api = new ApiService();
export default api;