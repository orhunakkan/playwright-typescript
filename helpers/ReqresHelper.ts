import {APIRequestContext} from '@playwright/test';

export async function get(request: APIRequestContext, endpoint: string) {
    const response = await request.get(endpoint);
    const body = await response.json();
    return {response, body};
}

export async function post(request: APIRequestContext, endpoint: string, data: any) {
    const response = await request.post(endpoint, {data});
    const body = await response.json();
    return {response, body};
}

export async function put(request: APIRequestContext, endpoint: string, data: any) {
    const response = await request.put(endpoint, {data});
    const body = await response.json();
    return {response, body};
}

export async function patch(request: APIRequestContext, endpoint: string, data: any) {
    const response = await request.patch(endpoint, {data});
    const body = await response.json();
    return {response, body};
}

export async function del(request: APIRequestContext, endpoint: string) {
    const response = await request.delete(endpoint);
    return {response};
}