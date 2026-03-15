import { DataProvider } from '@refinedev/core';
import { CrudFilter } from '../types';

const API_URL = '/api';

export const dataProvider: DataProvider = {
  getList: async ({ resource, filters }) => {
    let url = `${API_URL}/${resource}`;
    const params = new URLSearchParams();

    if (filters) {
      (filters as CrudFilter[]).forEach((filter) => {
        if ('field' in filter && filter.value) {
          params.append(filter.field, filter.value);
        }
      });
    }

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const response = await fetch(url);
    const data = await response.json();
    return { data: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 };
  },
  getOne: async ({ resource, id }) => {
    const response = await fetch(`${API_URL}/${resource}/${id}`);
    const data = await response.json();
    return { data };
  },
  create: async ({ resource, variables }) => {
    const response = await fetch(`${API_URL}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    });
    const data = await response.json();
    return { data };
  },
  update: async () => { throw new Error('Not implemented'); },
  deleteOne: async () => { throw new Error('Not implemented'); },
  getApiUrl: () => API_URL,
};
