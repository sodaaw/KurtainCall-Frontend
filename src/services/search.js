// src/services/search.js
import { http } from './http';

export const searchAPI = {
  search: (q, limit = 20) =>
    http.get('/search', { params: { q, limit } }),
};
