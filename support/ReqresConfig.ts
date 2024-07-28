export const BASE_URL = 'https://reqres.in/api';

export const ENDPOINTS = {
    users: '/users',
    singleUser: (id: number) => `/users/${id}`,
    resources: '/unknown',
    singleResource: (id: number) => `/unknown/${id}`,
    register: '/register',
    login: '/login',
    delayedResponse: '/users?delay=3'
};