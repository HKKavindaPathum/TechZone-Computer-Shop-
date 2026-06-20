const API_URL = '/api';

export const api = {
  get: async (endpoint, token = null) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    return res.json();
  },

  post: async (endpoint, data, token = null) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  put: async (endpoint, data, token = null) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (endpoint, token = null) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
    return res.json();
  },

  upload: async (endpoint, formData, token = null) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });
    return res.json();
  }
};