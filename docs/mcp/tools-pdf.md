# 📄 Playwright — PDF Export

> **Source:** [playwright.dev/mcp/tools-pdf](https://playwright.dev/mcp/tools-pdf)

---

Save the current page as a PDF file. Requires the **pdf capability**.

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--caps=pdf"]
    }
  }
}
```

---

## browser_pdf_save

Save the current page as a PDF file. The PDF is saved to the output directory.

```bash
→ browser_pdf_save
PDF saved to: /output/page-2024-03-15.pdf
```

> **Note:** PDF export requires the **pdf capability**, shown in the configuration above.

---

## Use cases

- Saving receipts or invoices from web applications
- Archiving web pages for offline review
- Generating reports from dashboards
- Creating documentation from rendered HTML
