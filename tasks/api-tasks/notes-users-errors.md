# Notes API — Users Error Handling

## URLs

- `POST https://practice.expandtesting.com/notes/api/users/register`
- `POST https://practice.expandtesting.com/notes/api/users/login`
- `GET https://practice.expandtesting.com/notes/api/users/profile`
- `PATCH https://practice.expandtesting.com/notes/api/users/profile`
- `DELETE https://practice.expandtesting.com/notes/api/users/logout`

## Overview

Verify that the user endpoints respond with the correct error codes and messages when requests are invalid or unauthorized. These tests run in a fixed order. The first test is a setup step that registers a user and obtains a valid auth token.

## Tests

1. Register a new user and log in to obtain a valid auth token. This is setup only — no assertions beyond confirming a token was received.

2. Attempt to register again using the same email address that was already registered. Verify the response status is 409.

3. Attempt to log in using the correct email but the wrong password. Verify the response status is 401.

4. Attempt to log in using an email address that has never been registered. Verify the response status is 401.

5. Attempt to retrieve the user profile without including any auth token. Verify the response status is 401.

6. Attempt to retrieve the user profile using a fake or malformed auth token. Verify the response status is 401.

7. Attempt to update the user profile without including any auth token. Verify the response status is 401.

8. Attempt to register a new user without providing a required field (such as the password). Verify the response status is 400.

9. Attempt to register a new user with a malformed email address (for example, missing the domain). Verify the response status is 400.

10. Log out using the valid auth token, then attempt to retrieve the user profile using the same token. Verify the response status is 401.
