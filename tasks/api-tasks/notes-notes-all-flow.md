# Notes API — Notes Full Flow

## URLs

- `POST https://practice.expandtesting.com/notes/api/users/register`
- `POST https://practice.expandtesting.com/notes/api/users/login`
- `POST https://practice.expandtesting.com/notes/api/notes`
- `GET https://practice.expandtesting.com/notes/api/notes`
- `GET https://practice.expandtesting.com/notes/api/notes/{id}`
- `PUT https://practice.expandtesting.com/notes/api/notes/{id}`
- `DELETE https://practice.expandtesting.com/notes/api/notes/{id}`

## Overview

Test the complete lifecycle of a note through the API. These tests run in a fixed order where each step depends on the previous one. The auth token and note IDs created in earlier steps are reused in later steps.

## Tests

1. Register a new user and verify the response status is 201. Confirm the response includes a user ID, the user's name, and email address.

2. Log in with the registered user's credentials and verify the response status is 200 with a login success message. Store the auth token from the response for use in all subsequent requests.

3. Create a first note by sending a title, description, and category along with the auth token. Verify the response status is 200 and confirm the note in the response contains an ID, timestamps, the correct category, and is associated with the registered user.

4. Create a second note using the same approach. Verify the response structure matches the first note.

5. Retrieve the first note by its ID using the auth token. Verify the response contains the same title, description, and category that were used when creating it.

6. Update the first note with new values for its fields using the auth token. Verify the response reflects all of the updated values correctly.

7. Retrieve all notes using the auth token. Verify the response contains exactly two notes and both notes are present with their correct data.

8. Delete the first note by its ID using the auth token. Verify the response status is 200 and includes a success message.

9. Attempt to retrieve the deleted note by its ID using the auth token. Verify the response status is 404.
