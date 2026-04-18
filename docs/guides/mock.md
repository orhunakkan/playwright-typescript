# 🎭 Playwright — Mock

> **Source:** [playwright.dev/docs/mock](https://playwright.dev/docs/mock)

---

## Introduction

Web APIs are usually implemented as HTTP endpoints. Playwright provides APIs to mock and modify network traffic, both HTTP and HTTPS. Any requests that a page does, including XHRs and fetch requests, can be tracked, modified and mocked. With Playwright you can also mock using HAR files that contain multiple network requests made by the page.

## Mock API requests

The following code will intercept all the calls to _/\*\*/api/v1/fruits and will return a custom response instead. No requests to the API will be made. The test goes to the URL that uses the mocked route and asserts that mock data is present on the page. test("mocks a fruit and doesn't call api", async ({ page }) => { // Mock the api call before navigating await page.route('_/\*\*/api/v1/fruits', async route => { const json = [{ name: 'Strawberry', id: 21 }]; await route.fulfill({ json }); }); // Go to the page await page.goto('https://demo.playwright.dev/api-mocking'); // Assert that the Strawberry fruit is visible await expect(page.getByText('Strawberry')).toBeVisible();}); You can see from the trace of the example test that the API was never called, it was however fulfilled with the mock data.

## Read more about advanced networking. Modify API responses

Sometimes, it is essential to make an API request, but the response needs to be patched to allow for reproducible testing. In that case, instead of mocking the request, one can perform the request and fulfill it with the modified response. In the example below we intercept the call to the fruit API and add a new fruit called 'Loquat', to the data. We then go to the url and assert that this data is there: test('gets the json from api and adds a new fruit', async ({ page }) => { // Get the response and add to it await page.route('\*/\*\*/api/v1/fruits', async route => { const response = await route.fetch(); const json = await response.json(); json.push({ name: 'Loquat', id: 100 }); // Fulfill using the original response, while patching the response body // with the given JSON object. await route.fulfill({ response, json }); }); // Go to the page await page.goto('https://demo.playwright.dev/api-mocking'); // Assert that the new fruit is visible await expect(page.getByText('Loquat', { exact: true })).toBeVisible();}); In the trace of our test we can see that the API was called and the response was modified. By inspecting the response we can see that our new fruit was added to the list.

## Read more about advanced networking. Mocking with HAR files

A HAR file is an HTTP Archive file that contains a record of all the network requests that are made when a page is loaded. It contains information about the request and response headers, cookies, content, timings, and more. You can use HAR files to mock network requests in your tests. You'll need to: Record a HAR file. Commit the HAR file alongside the tests.

## Route requests using the saved HAR files in the tests. Recording a HAR file

To record a HAR file we use page.routeFromHAR() or browserContext.routeFromHAR() method. This method takes in the path to the HAR file and an optional object of options. The options object can contain the URL so that only requests with the URL matching the specified glob pattern will be served from the HAR File. If not specified, all requests will be served from the HAR file. Setting update option to true will create or update the HAR file with the actual network information instead of serving the requests from the HAR file. Use it when creating a test to populate the HAR with real data. Alternatively, you can also record HAR files by using the recordHar option in browser.newContext() when creating a browser context. This allows you to capture all network traffic for the entire context until the context is closed.

## Modifying a HAR file

Once you have recorded a HAR file you can modify it by opening the hashed .txt file inside your 'hars' folder and editing the JSON. This file should be committed to your source control. Anytime you run this test with update: true it will update your HAR file with the request from the API. [ { "name": "Playwright", "id": 100 }, // ... other fruits]

## Replaying from HAR

Now that you have the HAR file recorded and modified the mock data, it can be used to serve matching responses in the test. For this, just turn off or simply remove the update option. This will run the test against the HAR file instead of hitting the API. test('gets the json from HAR and checks the new fruit has been added', async ({ page }) => { // Replay API requests from HAR. // Either use a matching response from the HAR, // or abort the request if nothing matches. await page.routeFromHAR('./hars/fruit.har', { url: '\*/\*\*/api/v1/fruits', update: false, }); // Go to the page await page.goto('https://demo.playwright.dev/api-mocking'); // Assert that the Playwright fruit is visible await expect(page.getByText('Playwright', { exact: true })).toBeVisible();}); In the trace of our test we can see that the route was fulfilled from the HAR file and the API was not called. If we inspect the response we can see our new fruit was added to the JSON, which was done by manually updating the hashed .txt file inside the hars folder. HAR replay matches URL and HTTP method strictly. For POST requests, it also matches POST payloads strictly. If multiple recordings match a request, the one with the most matching headers is picked. An entry resulting in a redirect will be followed automatically. Similar to when recording, if given HAR file name ends with .zip, it is considered an archive containing the HAR file along with network payloads stored as separate entries. You can also extract this archive, edit payloads or HAR log manually and point to the extracted har file. All the payloads will be resolved relative to the extracted har file on the file system.

## Recording HAR with CLI

We recommend the update option to record HAR file for your test. However, you can also record the HAR with Playwright CLI. Open the browser with Playwright CLI and pass --save-har option to produce a HAR file. Optionally, use --save-har-glob to only save requests you are interested in, for example API endpoints. If the har file name ends with .zip, artifacts are written as separate files and are all compressed into a single zip. # Save API requests from example.com as "example.har" archive.npx playwright open --save-har=example.har --save-har-glob="**/api/**" https://example.com

## Read more about advanced networking. Mock WebSockets

The following code will intercept WebSocket connections and mock entire communication over the WebSocket, instead of connecting to the server. This example responds to a "request" with a "response". await page.routeWebSocket('wss://example.com/ws', ws => { ws.onMessage(message => { if (message === 'request') ws.send('response'); });}); Alternatively, you may want to connect to the actual server, but intercept messages in-between and modify or block them. Here is an example that modifies some of the messages sent by the page to the server, and leaves the rest unmodified. await page.routeWebSocket('wss://example.com/ws', ws => { const server = ws.connectToServer(); ws.onMessage(message => { if (message === 'request') server.send('request2'); else server.send(message); });}); For more details, see WebSocketRoute.
