import { expect, test } from "@playwright/test";
import samplePayload from "../payloads/samplePayload.json";

const baseURL = "https://reqres.in/api";

test.describe("Reqres API Tests", () => {
  // Test to fetch a list of users
  test("should fetch a list of users", async ({ request }) => {
    const response = await request.get(`${baseURL}/users?page=2`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("data");
    expect(Array.isArray(responseBody.data)).toBe(true);
  });

  // Test to fetch a single user
  test("should fetch a single user", async ({ request }) => {
    const response = await request.get(`${baseURL}/users/2`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("data");
    expect(responseBody.data).toHaveProperty("id", 2);
  });

  // Test to return 404 for a non-existent user
  test("should return 404 for a non-existent user", async ({ request }) => {
    const response = await request.get(`${baseURL}/users/23`);
    expect(response.status()).toBe(404);
  });

  // Test to create a new user
  test("should create a new user", async ({ request }) => {
    const response = await request.post(`${baseURL}/users`, {
      data: samplePayload.newUser,
    });
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("name", samplePayload.newUser.name);
    expect(responseBody).toHaveProperty("job", samplePayload.newUser.job);
  });

  // Test to update a user using PUT
  test("should update a user", async ({ request }) => {
    const response = await request.put(`${baseURL}/users/2`, {
      data: samplePayload.updatedUserPut,
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "name",
      samplePayload.updatedUserPut.name
    );
    expect(responseBody).toHaveProperty(
      "job",
      samplePayload.updatedUserPut.job
    );
  });

  // Test to update a user using PATCH
  test("should update a user with PATCH", async ({ request }) => {
    const response = await request.patch(`${baseURL}/users/2`, {
      data: samplePayload.updatedUserPatch,
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "name",
      samplePayload.updatedUserPatch.name
    );
    expect(responseBody).toHaveProperty(
      "job",
      samplePayload.updatedUserPatch.job
    );
  });

  // Test to delete a user
  test("should delete a user", async ({ request }) => {
    const response = await request.delete(`${baseURL}/users/2`);
    expect(response.status()).toBe(204);
  });

  // Test to register a user successfully
  test("should register a user successfully", async ({ request }) => {
    const response = await request.post(`${baseURL}/register`, {
      data: samplePayload.newUserRegister,
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("id");
    expect(responseBody).toHaveProperty("token");
  });

  // Test to fail to register a user
  test("should fail to register a user", async ({ request }) => {
    const response = await request.post(`${baseURL}/register`, {
      data: samplePayload.failedUserRegister,
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
  });

  // Test to log in a user successfully
  test("should login a user successfully", async ({ request }) => {
    const response = await request.post(`${baseURL}/login`, {
      data: samplePayload.userLogin,
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("token");
  });

  // Test to fail to log in a user
  test("should fail to login a user", async ({ request }) => {
    const response = await request.post(`${baseURL}/login`, {
      data: samplePayload.failedUserLogin,
    });
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
  });

  // Test to fetch a list of resources
  test("should fetch a list of resources", async ({ request }) => {
    const response = await request.get(`${baseURL}/unknown`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("data");
    expect(Array.isArray(responseBody.data)).toBe(true);
  });

  // Test to fetch a single resource
  test("should fetch a single resource", async ({ request }) => {
    const response = await request.get(`${baseURL}/unknown/2`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("data");
    expect(responseBody.data).toHaveProperty("id", 2);
  });

  // Test to return 404 for a non-existent resource
  test("should return 404 for a non-existent resource", async ({ request }) => {
    const response = await request.get(`${baseURL}/unknown/23`);
    expect(response.status()).toBe(404);
  });

  // Test to fetch a delayed response
  test("should fetch a delayed response", async ({ request }) => {
    const response = await request.get(`${baseURL}/users?delay=3`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("data");
    expect(Array.isArray(responseBody.data)).toBe(true);
  });
});
