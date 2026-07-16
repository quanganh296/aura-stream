const API_BASE_URL = 'http://localhost:5000/api';

const adjustUrls = (obj) => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('/assets/')) {
      return '.' + obj;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(adjustUrls);
  }
  if (typeof obj === 'object') {
    for (const key in obj) {
      obj[key] = adjustUrls(obj[key]);
    }
  }
  return obj;
};

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('aura_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return adjustUrls(data);
};

export const authAPI = {
  login: async (identity, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identity, password })
    });
    if (data.token) {
      localStorage.setItem('aura_token', data.token);
    }
    return data;
  },

  register: async (username, email, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    if (data.token) {
      localStorage.setItem('aura_token', data.token);
    }
    return data;
  },

  getProfile: () => apiFetch('/auth/profile'),
  
  logout: () => {
    localStorage.removeItem('aura_token');
  }
};

export const songAPI = {
  getAll: () => apiFetch('/songs'),
  getById: (id) => apiFetch(`/songs/${id}`),
  search: (q) => apiFetch(`/songs/search?q=${encodeURIComponent(q)}`),
  getTrendingArtists: () => apiFetch('/songs/artists/trending'),
  getMixes: () => apiFetch('/songs/mixes/for-you'),
  getHistory: () => apiFetch('/songs/history/recent'),
  addHistory: (songId) => apiFetch('/songs/history', {
    method: 'POST',
    body: JSON.stringify({ songId })
  }),
  upload: async (formData) => {
    const token = localStorage.getItem('aura_token');
    const response = await fetch('http://localhost:5000/api/songs/upload', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return adjustUrls(data);
  }
};

export const playlistAPI = {
  getAll: () => apiFetch('/playlists'),
  getById: (id) => apiFetch(`/playlists/${id}`),
  create: (name, isPrivate = true) => apiFetch('/playlists', {
    method: 'POST',
    body: JSON.stringify({ name, isPrivate })
  }),
  addSong: (playlistId, songId) => apiFetch(`/playlists/${playlistId}/songs`, {
    method: 'POST',
    body: JSON.stringify({ songId })
  }),
  removeSong: (playlistId, songId) => apiFetch(`/playlists/${playlistId}/songs/${songId}`, {
    method: 'DELETE'
  }),
  likeSong: (songId) => apiFetch(`/playlists/likes/${songId}`, {
    method: 'POST'
  }),
  unlikeSong: (songId) => apiFetch(`/playlists/likes/${songId}`, {
    method: 'DELETE'
  }),
  getLikedSongs: () => apiFetch('/playlists/likes')
};
