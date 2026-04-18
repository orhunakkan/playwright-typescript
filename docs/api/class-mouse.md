# 📦 Playwright — Mouse

> **Source:** [playwright.dev/docs/api/class-mouse](https://playwright.dev/docs/api/class-mouse)

---

## MouseThe Mouse class operates in main-frame CSS pixels relative to the top-left corner of the viewport. tipIf you want to debug where the mouse moved, you can use the Trace viewer or Playwright Inspector. A red dot showing the location of the mouse will be shown for every mouse action. Every page object has its own Mouse, accessible with page.mouse. // Using ‘page.mouse’ to trace a 100x100 square.await page.mouse.move(0, 0);await page.mouse.down();await page.mouse.move(0, 100);await page.mouse.move(100, 100);await page.mouse.move(100, 0);await page.mouse.move(0, 0);await page.mouse.up(); Methods

click​ Added before v1.9 mouse.click Shortcut for mouse.move(), mouse.down(), mouse.up()

await mouse.click(x, y);await mouse.click(x, y, options); Arguments x number# X coordinate relative to the main frame's viewport in CSS pixels. y number# Y coordinate relative to the main frame's viewport in CSS pixels. options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. clickCount number (optional)# defaults to 1. See UIEvent.detail. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0

Promise<void># dblclick​ Added before v1.9 mouse.dblclick Shortcut for mouse.move(), mouse.down(), mouse.up(), mouse.down() and mouse.up()

await mouse.dblclick(x, y);await mouse.dblclick(x, y, options); Arguments x number# X coordinate relative to the main frame's viewport in CSS pixels. y number# Y coordinate relative to the main frame's viewport in CSS pixels. options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0

Promise<void># down​ Added before v1.9 mouse.down Dispatches a mousedown event

await mouse.down();await mouse.down(options); Arguments options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. clickCount number (optional)# defaults to 1. See UIEvent.detail

Promise<void># move​ Added before v1.9 mouse.move Dispatches a mousemove event

await mouse.move(x, y);await mouse.move(x, y, options); Arguments x number# X coordinate relative to the main frame's viewport in CSS pixels. y number# Y coordinate relative to the main frame's viewport in CSS pixels. options Object (optional) steps number (optional)# Defaults to 1. Sends n interpolated mousemove events to represent travel between Playwright's current cursor position and the provided destination. When set to 1, emits a single mousemove event at the destination location

Promise<void># up​ Added before v1.9 mouse.up Dispatches a mouseup event

await mouse.up();await mouse.up(options); Arguments options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. clickCount number (optional)# defaults to 1. See UIEvent.detail

Promise<void># wheel​ Added in: v1.15 mouse.wheel Dispatches a wheel event. This method is usually used to manually scroll the page. See scrolling for alternative ways to scroll. noteWheel events may cause scrolling if they are not handled, and this method does not wait for the scrolling to finish before returning

await mouse.wheel(deltaX, deltaY); Arguments deltaX number# Pixels to scroll horizontally. deltaY number# Pixels to scroll vertically

Promise<void>#
