# 📦 Playwright — Tracing

> **Source:** [playwright.dev/docs/api/class-tracing](https://playwright.dev/docs/api/class-tracing)

---

## TracingAPI for collecting and saving Playwright traces. Playwright traces can be opened in Trace Viewer after Playwright script runs. noteYou probably want to enable tracing in your config file instead of using context.tracing.The context.tracing API captures browser operations and network activity, but it doesn't record test assertions (like expect calls). We recommend enabling tracing through Playwright Test configuration, which includes those assertions and provides a more complete trace for debugging test failures. Start recording a trace before performing actions. At the end, stop tracing and save it to a file. const browser = await chromium.launch();const context = await browser.newContext();await context.tracing.start({ screenshots: true, snapshots: true });const page = await context.newPage();await page.goto('https://playwright.dev');expect(page.url()).toBe('https://playwright.dev');await context.tracing.stop({ path: 'trace.zip' }); Methods

group​ Added in: v1.49 tracing.group cautionUse test.step instead when available. Creates a new group within the trace, assigning any subsequent API calls to this group, until tracing.groupEnd() is called. Groups can be nested and will be visible in the trace viewer

// use test.step insteadawait test.step('Log in', async () => { // ...}); Arguments name string# Group name shown in the trace viewer. options Object (optional) location Object (optional)# file string line number (optional) column number (optional) Specifies a custom location for the group to be shown in the trace viewer. Defaults to the location of the tracing.group() call

Promise<Disposable># group

## End

Added in: v1.49 tracing.groupEnd Closes the last group created by tracing.group()

await tracing.groupEnd(); Returns Promise<void># start​ Added in: v1.12 tracing.start Start tracing. noteYou probably want to enable tracing in your config file instead of using Tracing.start.The context.tracing API captures browser operations and network activity, but it doesn't record test assertions (like expect calls). We recommend enabling tracing through Playwright Test configuration, which includes those assertions and provides a more complete trace for debugging test failures

await context.tracing.start({ screenshots: true, snapshots: true });const page = await context.newPage();await page.goto('https://playwright.dev');expect(page.url()).toBe('https://playwright.dev');await context.tracing.stop({ path: 'trace.zip' }); Arguments options Object (optional) live boolean (optional) Added in: v1.59# When enabled, the trace is written to an unarchived file that is updated in real time as actions occur, instead of caching changes and archiving them into a zip file at the end. This is useful for live trace viewing during test execution. name string (optional)# If specified, intermediate trace files are going to be saved into the files with the given name prefix inside the tracesDir directory specified in browserType.launch(). To specify the final trace zip file name, you need to pass path option to tracing.stop() instead. screenshots boolean (optional)# Whether to capture screenshots during tracing. Screenshots are used to build a timeline preview. snapshots boolean (optional)# If this option is true tracing will capture DOM snapshot on every action record network activity sources boolean (optional) Added in: v1.17# Whether to include source files for trace actions. title string (optional) Added in: v1.17# Trace name to be shown in the Trace Viewer

Promise<void># start

## Chunk

Added in: v1.15 tracing.startChunk Start a new trace chunk. If you'd like to record multiple traces on the same BrowserContext, use tracing.start() once, and then create multiple trace chunks with tracing.startChunk() and tracing.stopChunk()

await context.tracing.start({ screenshots: true, snapshots: true });const page = await context.newPage();await page.goto('https://playwright.dev');await context.tracing.startChunk();await page.getByText('Get Started').click();// Everything between startChunk and stopChunk will be recorded in the trace.await context.tracing.stopChunk({ path: 'trace1.zip' });await context.tracing.startChunk();await page.goto('http://example.com');// Save a second trace file with different actions.await context.tracing.stopChunk({ path: 'trace2.zip' }); Arguments options Object (optional) name string (optional) Added in: v1.32# If specified, intermediate trace files are going to be saved into the files with the given name prefix inside the tracesDir directory specified in browserType.launch(). To specify the final trace zip file name, you need to pass path option to tracing.stopChunk() instead. title string (optional) Added in: v1.17# Trace name to be shown in the Trace Viewer

Promise<void># stop​ Added in: v1.12 tracing.stop Stop tracing

await tracing.stop();await tracing.stop(options); Arguments options Object (optional) path string (optional)# Export trace into the file with the given path

Promise<void># stop

## Chunk

Added in: v1.15 tracing.stopChunk Stop the trace chunk. See tracing.startChunk() for more details about multiple trace chunks

await tracing.stopChunk();await tracing.stopChunk(options); Arguments options Object (optional) path string (optional)# Export trace collected since the last tracing.startChunk() call into the file with the given path

Promise<void>#
