/**
 * ResQConnect Centralized API Client
 * Built with native Fetch API and Vite development proxy.
 *
 * Security features:
 * - Cookie-based HttpOnly JWT sessions (credentials: 'include')
 * - Dual-submit CSRF protection for mutating requests
 * - Normalized error handling without leaking tokens or personal information
 */

/**
 * Resolves the API root endpoint:
 * 1. If VITE_API_URL is configured (e.g. deployed backend URL), uses that URL.
 * 2. Defaults to '/api' for local Vite proxy or Vercel rewrites.
 */
function getApiBaseUrl() {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.trim().replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Extracts CSRF token from document.cookie
 */
function getXsrfToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Normalizes backend entity identifiers (guarantees both `id` and `_id` are populated)
 */
export function normalizeEntity(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id;
  const _id = item._id || item.id;
  return {
    ...item,
    id: id ? String(id) : undefined,
    _id: _id ? String(_id) : undefined,
  };
}

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Support Authorization: Bearer token for seamless cross-origin and cookie-less environments
  if (typeof localStorage !== 'undefined') {
    const savedToken = localStorage.getItem('resq_token');
    if (savedToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
  }

  // Attach Content-Type for request bodies
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Double-submit CSRF token header on mutating operations
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const xsrfToken = getXsrfToken();
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken;
    }
  }

  const config = {
    ...options,
    method,
    headers,
    credentials: 'include', // Includes HttpOnly and XSRF cookies
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON response body if present
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        if (text && text.trim().startsWith('<')) {
          const htmlError = new Error(
            'Received HTML response from server instead of JSON API data. Ensure VITE_API_URL points to the live backend server.'
          );
          htmlError.status = response.ok ? 502 : response.status;
          throw htmlError;
        }
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Distinguish between API error responses and network failures
    if (error.status) {
      throw error;
    }
    const networkError = new Error('Network error or server unreachable. Please check your connection.');
    networkError.status = 0;
    networkError.originalError = error;
    throw networkError;
  }
}

// ============================================================================
// Auth API Endpoints
// ============================================================================
export const authApi = {
  login: async ({ email, password }) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('resq_token', res.token);
    }
    return {
      ...res,
      user: normalizeEntity(res.user),
    };
  },

  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res?.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('resq_token', res.token);
    }
    return {
      ...res,
      user: normalizeEntity(res.user),
    };
  },

  getMe: async () => {
    try {
      const res = await request('/auth/me', { method: 'GET' });
      return {
        ...res,
        user: normalizeEntity(res.user),
      };
    } catch (err) {
      if (err.status === 401 && typeof localStorage !== 'undefined') {
        localStorage.removeItem('resq_token');
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      return await request('/auth/logout', { method: 'POST' });
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('resq_token');
      }
    }
  },

  demoSwitch: async (role) => {
    const res = await request('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (res?.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('resq_token', res.token);
    }
    return {
      ...res,
      user: normalizeEntity(res.user),
    };
  },
};

// ============================================================================
// Assistance Requests API Endpoints
// ============================================================================
export const requestsApi = {
  getRequests: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.category && filters.category !== 'All') query.append('category', filters.category);
    if (filters.priority && filters.priority !== 'All') query.append('priority', filters.priority);
    if (filters.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters.search) query.append('search', filters.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/requests${queryString}`, { method: 'GET' });
    const items = (res.data || []).map(normalizeEntity);
    return { ...res, data: items };
  },

  getRequestById: async (id) => {
    const res = await request(`/requests/${encodeURIComponent(id)}`, { method: 'GET' });
    return { ...res, data: normalizeEntity(res.data) };
  },

  createRequest: async (formData) => {
    const res = await request('/requests', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  updateStatus: async (id, status, note) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  claimVolunteerTask: async (id) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/volunteer/claim`, {
      method: 'POST',
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  addVolunteerCheckIn: async (id, note) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/volunteer/checkin`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  completeVolunteerTask: async (id, completionNote, proofDescription) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/volunteer/complete`, {
      method: 'POST',
      body: JSON.stringify({ completionNote, proofDescription }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  assignVolunteer: async (id, volunteerId) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/ngo/assign`, {
      method: 'POST',
      body: JSON.stringify({ volunteerId }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  allocateResource: async (id, resourceId, quantity) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/ngo/allocate`, {
      method: 'POST',
      body: JSON.stringify({ resourceId, quantity: Number(quantity) }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  flagRequest: async (id, isFlagged, reason) => {
    const res = await request(`/requests/${encodeURIComponent(id)}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ isFlagged, reason }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },
};

// ============================================================================
// Resources (Relief Inventory) API Endpoints
// ============================================================================
export const resourcesApi = {
  getResources: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.category && filters.category !== 'All') query.append('category', filters.category);
    if (filters.status && filters.status !== 'All') query.append('status', filters.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/resources${queryString}`, { method: 'GET' });
    const items = (res.data || []).map(normalizeEntity);
    return { ...res, data: items };
  },

  createResource: async (resourceData) => {
    const res = await request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  updateResource: async (id, updateData) => {
    const res = await request(`/resources/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },
};

// ============================================================================
// Recovery Hubs API Endpoints
// ============================================================================
export const hubsApi = {
  getHubs: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters.zone && filters.zone !== 'All') query.append('zone', filters.zone);
    if (filters.search) query.append('search', filters.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/hubs${queryString}`, { method: 'GET' });
    const items = (res.data || []).map(normalizeEntity);
    return { ...res, data: items };
  },

  createHub: async (hubData) => {
    const res = await request('/hubs', {
      method: 'POST',
      body: JSON.stringify(hubData),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },
};

// ============================================================================
// Notifications API Endpoints
// ============================================================================
export const notificationsApi = {
  getNotifications: async () => {
    const res = await request('/notifications', { method: 'GET' });
    const items = (res.data || []).map(normalizeEntity);
    return { ...res, data: items };
  },

  markRead: async (id) => {
    const res = await request(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  markAllRead: async () => {
    return await request('/notifications/read-all', { method: 'PATCH' });
  },

  deleteNotification: async (id) => {
    return await request(`/notifications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Admin & Moderation API Endpoints
// ============================================================================
export const adminApi = {
  getUsers: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.role && filters.role !== 'All') query.append('role', filters.role);
    if (filters.verified !== undefined && filters.verified !== 'All') query.append('verified', filters.verified);
    if (filters.pendingOnly) query.append('pendingOnly', 'true');
    if (filters.search) query.append('search', filters.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/admin/users${queryString}`, { method: 'GET' });
    const items = (res.data || []).map(normalizeEntity);
    return { ...res, data: items };
  },

  verifyUser: async (id, notes) => {
    const res = await request(`/admin/users/${encodeURIComponent(id)}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  rejectUser: async (id, reason) => {
    const res = await request(`/admin/users/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return { ...res, data: normalizeEntity(res.data) };
  },

  getAuditLogs: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.actionType && filters.actionType !== 'All') query.append('actionType', filters.actionType);
    if (filters.actorRole && filters.actorRole !== 'All') query.append('actorRole', filters.actorRole);
    if (filters.search) query.append('search', filters.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/admin/audit-logs${queryString}`, { method: 'GET' });
    const items = (res.data || []).map(normalizeEntity);
    return { ...res, data: items };
  },

  resetDemoData: async () => {
    return await request('/admin/reset-demo-data', { method: 'POST' });
  },
};

export default {
  auth: authApi,
  requests: requestsApi,
  resources: resourcesApi,
  hubs: hubsApi,
  notifications: notificationsApi,
  admin: adminApi,
};
