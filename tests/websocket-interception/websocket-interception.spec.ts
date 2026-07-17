import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import { faker } from '@faker-js/faker';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-26 — WebSocket Interception

const URL = '/practice/websocket-interception';

test.describe('WebSocket Interception', () => {
  // AC-1 (TAB1-26): Tests register a page.routeWebSocket() handler before clicking Connect and
  // assert the status indicator transitions from "connecting" to "connected"
  test.describe('AC-1 — routeWebSocket registered pre-Connect; status "connecting" → "connected"', () => {
    test('positive: status transitions connecting -> connected after Connect is clicked', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeAndDelayOpen((ws) => ws.onMessage(() => {}));
      await page.goto(URL);
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('disconnected');

      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connecting');
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');
    });

    test('negative: status remains "disconnected" before Connect is clicked', async ({ page, websocketInterceptionPage }) => {
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => ws.onMessage(() => {}));
      await page.goto(URL);
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('disconnected');
      await expect(websocketInterceptionPage.connectButton).toBeEnabled();
      await expect(websocketInterceptionPage.disconnectButton).toBeDisabled();
    });
  });

  // AC-2 (TAB1-26, Challenge 1 — full mock): Tests intercept the URL without connecting to the
  // real server, push a fabricated message from the handler, and assert it appears in the chat log
  test.describe('AC-2 (Challenge 1 — full mock) — fabricated message renders without contacting the real server', () => {
    test('positive: a handler-pushed message renders in the chat log', async ({ page, websocketInterceptionPage }) => {
      const fabricated = `mock-msg-${faker.string.alphanumeric(10)}`;
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => {
        ws.onMessage(() => {});
        ws.send(fabricated);
      });
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');
      await expect(websocketInterceptionPage.messageLog).toContainText(fabricated);
    });

    test("negative: the real server's welcome text never appears when the connection is fully mocked", async ({
      page,
      websocketInterceptionPage,
    }) => {
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => ws.onMessage(() => {}));
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');
      await page.waitForTimeout(500);
      await expect(websocketInterceptionPage.messageLog).not.toContainText('Welcome to the Stagecraft WebSocket server!');
    });
  });

  // AC-3 (TAB1-26, Challenge 2 — selective forward): Tests connect to the real server, forward
  // most messages, and modify "ticker" messages before they reach the page
  test.describe('AC-3 (Challenge 2 — selective forward) — ticker frames are rewritten; everything else passes through', () => {
    test('positive: a "ticker" server message is rewritten before reaching the page', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeSelectiveForward();
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');
      await expect(websocketInterceptionPage.messageLog).toContainText('ticker (intercepted): rewritten', { timeout: 10_000 });
      await expect(websocketInterceptionPage.messageLog).not.toContainText(/ticker: \d{4}-\d{2}-\d{2}T/);
    });

    test('negative: non-ticker server messages are forwarded unmodified', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeSelectiveForward();
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.messageLog).toContainText('Welcome to the Stagecraft WebSocket server!');
    });
  });

  // AC-4 (TAB1-26, Challenge 3 — block frames): Tests let the connection succeed but block
  // outgoing messages containing "block", asserting the server never echoes them back
  test.describe('AC-4 (Challenge 3 — block frames) — outgoing "block" frames are never echoed', () => {
    test('positive: a message containing "block" is never echoed back by the server', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeBlockingFrames();
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');

      const blockedText = `please block-${faker.string.alphanumeric(6)}`;
      await websocketInterceptionPage.messageInput.fill(blockedText);
      await websocketInterceptionPage.sendButton.click();

      await expect(websocketInterceptionPage.messageLog).toContainText(blockedText);
      await page.waitForTimeout(1000);
      await expect(websocketInterceptionPage.messageLog).not.toContainText(`echo: ${blockedText}`);
    });

    test('negative: a message that does not contain "block" is still forwarded and echoed', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeBlockingFrames();
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();

      const normalText = `hello-${faker.string.alphanumeric(6)}`;
      await websocketInterceptionPage.messageInput.fill(normalText);
      await websocketInterceptionPage.sendButton.click();

      await expect(websocketInterceptionPage.messageLog).toContainText(`echo: ${normalText}`);
    });

    test('boundary: a message containing "block" as a substring (e.g. "unblock") is also blocked', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeBlockingFrames();
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();

      const substringText = `please unblock-${faker.string.alphanumeric(4)}`;
      await websocketInterceptionPage.messageInput.fill(substringText);
      await websocketInterceptionPage.sendButton.click();

      await expect(websocketInterceptionPage.messageLog).toContainText(substringText);
      await page.waitForTimeout(1000);
      await expect(websocketInterceptionPage.messageLog).not.toContainText(`echo: ${substringText}`);
    });
  });

  // AC-5 (TAB1-26): Tests intercept an outgoing client message and assert its content matches
  // what was typed in the input field
  test.describe('AC-5 — an intercepted outgoing message matches the typed input', () => {
    test('positive: the message captured by onMessage exactly matches what was typed', async ({ page, websocketInterceptionPage }) => {
      let captured: string | undefined;
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => {
        const server = ws.connectToServer();
        ws.onMessage((message) => {
          captured = message.toString();
          server.send(message);
        });
        server.onMessage((message) => ws.send(message));
      });
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');

      const typed = `intercept-check-${faker.string.alphanumeric(8)}`;
      await websocketInterceptionPage.messageInput.fill(typed);
      await websocketInterceptionPage.sendButton.click();

      await expect.poll(() => captured).toBe(typed);
    });

    test('negative: an empty input keeps Send disabled, so no client message is ever intercepted', async ({ page, websocketInterceptionPage }) => {
      let interceptCount = 0;
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => {
        const server = ws.connectToServer();
        ws.onMessage((message) => {
          interceptCount++;
          server.send(message);
        });
        server.onMessage((message) => ws.send(message));
      });
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');

      await expect(websocketInterceptionPage.messageInput).toHaveValue('');
      await expect(websocketInterceptionPage.sendButton).toBeDisabled();
      expect(interceptCount).toBe(0);
    });
  });

  // AC-6 (TAB1-26): Tests are isolated — WebSocket stubs prevent message bleed between tests
  test.describe('AC-6 — WebSocket stubs prevent message bleed between tests', () => {
    const bleedMarker = `isolation-check-${faker.string.alphanumeric(10)}`;

    test("positive (test A): a fabricated message is sent under this test's isolated stub", async ({ page, websocketInterceptionPage }) => {
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => {
        ws.onMessage(() => {});
        ws.send(bleedMarker);
      });
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.messageLog).toContainText(bleedMarker);
    });

    test("positive (test B): a fresh test never sees the previous test's fabricated message", async ({ page, websocketInterceptionPage }) => {
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => ws.onMessage(() => {}));
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connected');
      await expect(websocketInterceptionPage.messageLog).not.toContainText(bleedMarker);
    });
  });

  // Accessibility — scan disconnected (load), connecting, and connected-with-messages states
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load (disconnected)', async ({ page }) => {
      await page.goto(URL);
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations while the connection is pending ("connecting")', async ({ page, websocketInterceptionPage }) => {
      await websocketInterceptionPage.routeAndDelayOpen((ws) => ws.onMessage(() => {}), 2000);
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.statusIndicator).toHaveText('connecting');
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations once connected with messages in the log', async ({ page, websocketInterceptionPage }) => {
      await page.routeWebSocket(websocketInterceptionPage.wsUrl, (ws) => {
        ws.onMessage(() => {});
        ws.send('a11y-check message');
      });
      await page.goto(URL);
      await websocketInterceptionPage.connectButton.click();
      await expect(websocketInterceptionPage.messageLog).toContainText('a11y-check message');
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial websocket-interception page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
