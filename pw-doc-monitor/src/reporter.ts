import { query } from './db/connection.js';
import { logger } from './db/logger.js';
import { promises as fs } from 'fs';
import path from 'path';

export class Reporter {
  async reportLatest(): Promise<string> {
    try {
      const runResult = await query(`SELECT * FROM runs WHERE status = $1 ORDER BY completed_at DESC LIMIT 1`, ['completed']);

      if (!runResult.rows.length) {
        return 'No completed runs found';
      }

      const run = runResult.rows[0];
      const runId = run.run_id;

      // Get error summary
      const errorResult = await query(`SELECT error_type, COUNT(*) as count FROM error_events WHERE run_id = (SELECT id FROM runs WHERE run_id = $1) GROUP BY error_type`, [runId]);

      // Get top changed pages
      const changedResult = await query(
        `SELECT 
          p.url, ps.title, 
          ps.text_hash, ps.headings_hash, ps.code_hash, ps.links_hash,
          ps_prev.text_hash as prev_text_hash
        FROM page_snapshots ps
        JOIN pages p ON ps.page_id = p.id
        LEFT JOIN page_snapshots ps_prev ON p.id = ps_prev.page_id 
          AND ps_prev.run_id < ps.run_id
        WHERE ps.run_id = (SELECT id FROM runs WHERE run_id = $1)
        ORDER BY ps.created_at DESC
        LIMIT 10`,
        [runId]
      );

      // Get worst performing pages
      const perfResult = await query(
        `SELECT 
          p.url, 
          po.load_ms,
          po.domcontentloaded_ms,
          po.resource_count
        FROM performance_observations po
        JOIN pages p ON po.page_id = p.id
        WHERE po.run_id = (SELECT id FROM runs WHERE run_id = $1)
        ORDER BY po.load_ms DESC NULLS LAST
        LIMIT 10`,
        [runId]
      );

      // Get top error URLs
      const errorUrlResult = await query(
        `SELECT 
          url, 
          COUNT(*) as error_count,
          error_type
        FROM error_events 
        WHERE run_id = (SELECT id FROM runs WHERE run_id = $1)
        GROUP BY url, error_type
        ORDER BY error_count DESC
        LIMIT 10`,
        [runId]
      );

      let report = `# Playwright Docs Monitor - Latest Report\n\n`;
      report += `**Run ID**: ${runId}\n`;
      report += `**Started**: ${new Date(run.started_at).toISOString()}\n`;
      report += `**Completed**: ${new Date(run.completed_at).toISOString()}\n`;
      report += `**Duration**: ${run.total_duration_ms}ms\n\n`;

      report += `## Summary\n`;
      report += `- **Pages Discovered**: ${run.total_pages_discovered}\n`;
      report += `- **Pages Crawled**: ${run.total_pages_crawled}\n`;
      report += `- **Pages Changed**: ${run.pages_changed}\n`;
      report += `- **Pages New**: ${run.pages_new}\n`;
      report += `- **Total Errors**: ${run.total_errors}\n\n`;

      report += `## Error Breakdown\n`;
      for (const error of errorResult.rows) {
        report += `- ${error.error_type}: ${error.count}\n`;
      }
      report += '\n';

      report += `## Top 10 Changed Pages\n`;
      for (const page of changedResult.rows) {
        report += `- [${page.url}](${page.url})\n`;
        report += `  - Title: ${page.title}\n`;
      }
      report += '\n';

      report += `## Worst 10 Performing Pages\n`;
      for (const page of perfResult.rows) {
        report += `- [${page.url}](${page.url})\n`;
        report += `  - Load Time: ${page.load_ms}ms\n`;
        report += `  - DOM Content Loaded: ${page.domcontentloaded_ms}ms\n`;
        report += `  - Resource Count: ${page.resource_count}\n`;
      }
      report += '\n';

      report += `## Top 10 Error URLs\n`;
      for (const errorUrl of errorUrlResult.rows) {
        report += `- [${errorUrl.url}](${errorUrl.url})\n`;
        report += `  - Error Type: ${errorUrl.error_type}\n`;
        report += `  - Count: ${errorUrl.error_count}\n`;
      }

      return report;
    } catch (err) {
      logger.error(`Failed to generate latest report: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  async reportDiff(fromRunId: string, toRunId: string): Promise<string> {
    try {
      const fromRun = await query('SELECT id FROM runs WHERE run_id = $1', [fromRunId]);
      const toRun = await query('SELECT id FROM runs WHERE run_id = $1', [toRunId]);

      if (!fromRun.rows.length || !toRun.rows.length) {
        return 'One or both runs not found';
      }

      const fromRunDbId = fromRun.rows[0].id;
      const toRunDbId = toRun.rows[0].id;

      const changedResult = await query(
        `SELECT 
          p.url,
          CASE 
            WHEN ps_from IS NULL THEN 'new'
            WHEN ps_to IS NULL THEN 'removed'
            WHEN ps_from.text_hash != ps_to.text_hash THEN 'changed'
            ELSE 'unchanged'
          END as status
        FROM pages p
        LEFT JOIN page_snapshots ps_from ON p.id = ps_from.page_id AND ps_from.run_id = $1
        LEFT JOIN page_snapshots ps_to ON p.id = ps_to.page_id AND ps_to.run_id = $2
        WHERE ps_from IS NOT NULL OR ps_to IS NOT NULL
        ORDER BY p.url`,
        [fromRunDbId, toRunDbId]
      );

      let report = `# Diff Report\n\n`;
      report += `**From Run**: ${fromRunId}\n`;
      report += `**To Run**: ${toRunId}\n\n`;

      const newCount = changedResult.rows.filter((r: any) => r.status === 'new').length;
      const removedCount = changedResult.rows.filter((r: any) => r.status === 'removed').length;
      const changedCount = changedResult.rows.filter((r: any) => r.status === 'changed').length;

      report += `## Summary\n`;
      report += `- **New Pages**: ${newCount}\n`;
      report += `- **Removed Pages**: ${removedCount}\n`;
      report += `- **Changed Pages**: ${changedCount}\n\n`;

      report += `## Changed Pages\n`;
      for (const page of changedResult.rows.filter((r: any) => r.status === 'changed')) {
        report += `- ${page.url}\n`;
      }
      report += '\n';

      report += `## New Pages\n`;
      for (const page of changedResult.rows.filter((r: any) => r.status === 'new')) {
        report += `- ${page.url}\n`;
      }
      report += '\n';

      report += `## Removed Pages\n`;
      for (const page of changedResult.rows.filter((r: any) => r.status === 'removed')) {
        report += `- ${page.url}\n`;
      }

      return report;
    } catch (err) {
      logger.error(`Failed to generate diff report: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  async reportPage(url: string, limit: number = 10): Promise<string> {
    try {
      const pageResult = await query('SELECT id FROM pages WHERE url = $1', [url]);

      if (!pageResult.rows.length) {
        return `Page ${url} not found in database`;
      }

      const pageId = pageResult.rows[0].id;

      const snapshotsResult = await query(
        `SELECT 
          ps.*, 
          r.run_id, 
          r.started_at,
          po.load_ms,
          po.domcontentloaded_ms
        FROM page_snapshots ps
        JOIN runs r ON ps.run_id = r.id
        LEFT JOIN performance_observations po ON ps.run_id = po.run_id AND ps.page_id = po.page_id
        WHERE ps.page_id = $1
        ORDER BY ps.created_at DESC
        LIMIT $2`,
        [pageId, limit]
      );

      if (!snapshotsResult.rows.length) {
        return `No snapshots found for ${url}`;
      }

      let report = `# Page History Report\n\n`;
      report += `**URL**: ${url}\n`;
      report += `**Total Snapshots**: ${snapshotsResult.rows.length}\n\n`;

      report += `## Recent Snapshots\n`;
      for (const snapshot of snapshotsResult.rows) {
        report += `### Run ${snapshot.run_id.toString().slice(0, 8)}\n`;
        report += `- **Date**: ${new Date(snapshot.started_at).toISOString()}\n`;
        report += `- **Title**: ${snapshot.title}\n`;
        report += `- **Text Hash**: ${snapshot.text_hash}\n`;
        report += `- **Headings Hash**: ${snapshot.headings_hash}\n`;
        report += `- **Code Hash**: ${snapshot.code_hash}\n`;
        report += `- **Links Hash**: ${snapshot.links_hash}\n`;
        report += `- **Load Time**: ${snapshot.load_ms}ms\n`;
        report += `- **DOM Content Loaded**: ${snapshot.domcontentloaded_ms}ms\n\n`;
      }

      return report;
    } catch (err) {
      logger.error(`Failed to generate page report: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  async generateHtmlReport(runId?: string): Promise<string> {
    try {
      let runResult;
      if (runId) {
        runResult = await query(`SELECT * FROM runs WHERE run_id = $1`, [runId]);
      } else {
        runResult = await query(`SELECT * FROM runs WHERE status = $1 ORDER BY completed_at DESC LIMIT 1`, ['completed']);
      }

      if (!runResult.rows.length) {
        throw new Error('No completed runs found');
      }

      const run = runResult.rows[0];
      const runIdValue = run.run_id;

      // Get error summary
      const errorResult = await query(`SELECT error_type, COUNT(*) as count FROM error_events WHERE run_id = (SELECT id FROM runs WHERE run_id = $1) GROUP BY error_type ORDER BY count DESC`, [
        runIdValue,
      ]);

      // Get changed pages
      const changedResult = await query(
        `SELECT 
          p.url, ps.title, 
          ps.text_hash, ps.headings_hash, ps.code_hash, ps.links_hash,
          ps_prev.text_hash as prev_text_hash,
          ps_prev.headings_hash as prev_headings_hash,
          ps_prev.code_hash as prev_code_hash,
          ps_prev.links_hash as prev_links_hash
        FROM page_snapshots ps
        JOIN pages p ON ps.page_id = p.id
        LEFT JOIN page_snapshots ps_prev ON p.id = ps_prev.page_id 
          AND ps_prev.run_id = (
            SELECT MAX(r2.id) FROM runs r2 
            WHERE r2.id < ps.run_id AND r2.status = 'completed'
          )
        WHERE ps.run_id = (SELECT id FROM runs WHERE run_id = $1)
          AND (
            ps_prev.text_hash IS NULL
            OR ps.text_hash != ps_prev.text_hash 
            OR ps.headings_hash != ps_prev.headings_hash 
            OR ps.code_hash != ps_prev.code_hash 
            OR ps.links_hash != ps_prev.links_hash
          )
        ORDER BY p.url`,
        [runIdValue]
      );

      // Get new pages
      const newPagesResult = await query(
        `SELECT p.url, ps.title
        FROM page_snapshots ps
        JOIN pages p ON ps.page_id = p.id
        WHERE ps.run_id = (SELECT id FROM runs WHERE run_id = $1)
          AND NOT EXISTS (
            SELECT 1 FROM page_snapshots ps_prev
            WHERE ps_prev.page_id = p.id
              AND ps_prev.run_id < ps.run_id
          )
        ORDER BY p.url`,
        [runIdValue]
      );

      // Get worst performing pages
      const perfResult = await query(
        `SELECT 
          p.url, 
          po.load_ms,
          po.domcontentloaded_ms,
          po.resource_count
        FROM performance_observations po
        JOIN pages p ON po.page_id = p.id
        WHERE po.run_id = (SELECT id FROM runs WHERE run_id = $1)
        ORDER BY po.load_ms DESC NULLS LAST
        LIMIT 10`,
        [runIdValue]
      );

      // Get top error URLs
      const errorUrlResult = await query(
        `SELECT 
          url, 
          COUNT(*) as error_count,
          error_type
        FROM error_events 
        WHERE run_id = (SELECT id FROM runs WHERE run_id = $1)
        GROUP BY url, error_type
        ORDER BY error_count DESC
        LIMIT 10`,
        [runIdValue]
      );

      const startedAt = new Date(run.started_at);
      const completedAt = new Date(run.completed_at);
      const duration = run.total_duration_ms;

      const html = this.buildHtmlTemplate({
        runId: runIdValue,
        startedAt,
        completedAt,
        duration,
        summary: {
          pagesDiscovered: run.total_pages_discovered,
          pagesCrawled: run.total_pages_crawled,
          pagesChanged: run.pages_changed,
          pagesNew: run.pages_new,
          totalErrors: run.total_errors,
        },
        errors: errorResult.rows,
        changedPages: changedResult.rows,
        newPages: newPagesResult.rows,
        perfPages: perfResult.rows,
        errorUrls: errorUrlResult.rows,
      });

      // Save HTML report
      const outputDir = path.join(process.cwd(), 'pw-doc-monitor', 'monitoring-report');
      await fs.mkdir(outputDir, { recursive: true });

      const timestamp = startedAt.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `report-${timestamp}.html`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(filepath, html, 'utf-8');
      logger.info(`HTML report saved to ${filepath}`);

      // Also save as latest.html
      const latestPath = path.join(outputDir, 'latest.html');
      await fs.writeFile(latestPath, html, 'utf-8');
      logger.info(`HTML report also saved to ${latestPath}`);

      return filepath;
    } catch (err) {
      logger.error(`Failed to generate HTML report: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  private buildHtmlTemplate(data: {
    runId: string;
    startedAt: Date;
    completedAt: Date;
    duration: number;
    summary: {
      pagesDiscovered: number;
      pagesCrawled: number;
      pagesChanged: number;
      pagesNew: number;
      totalErrors: number;
    };
    errors: any[];
    changedPages: any[];
    newPages: any[];
    perfPages: any[];
    errorUrls: any[];
  }): string {
    const { runId, startedAt, completedAt, duration, summary, errors, changedPages, newPages, perfPages, errorUrls } = data;

    const formatDuration = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hrs = Math.floor(minutes / 60);
      if (hrs > 0) return `${hrs}h ${minutes % 60}m ${seconds % 60}s`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    };

    const statusColor = summary.pagesChanged === 0 && summary.totalErrors === 0 ? '#10b981' : summary.pagesChanged > 0 ? '#f59e0b' : '#ef4444';
    const statusText = summary.pagesChanged === 0 && summary.totalErrors === 0 ? '✓ No Changes' : summary.pagesChanged > 0 ? `⚠ ${summary.pagesChanged} Changed` : '✗ Errors';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Docs Monitor Report - ${startedAt.toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header .run-info {
      opacity: 0.9;
      font-size: 14px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin-top: 10px;
      background: ${statusColor};
    }
    .content {
      padding: 30px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .metric-card .label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 5px;
    }
    .metric-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    .metric-card.warning {
      border-left-color: #f59e0b;
    }
    .metric-card.error {
      border-left-color: #ef4444;
    }
    .metric-card.success {
      border-left-color: #10b981;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 15px;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #f9fafb;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      font-size: 13px;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tr:hover {
      background: #f9fafb;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .url-cell {
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
      font-style: italic;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .change-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: #fef3c7;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Playwright Docs Monitor Report</h1>
      <div class="run-info">
        <div>Run ID: <code>${runId}</code></div>
        <div>Started: ${startedAt.toLocaleString()}</div>
        <div>Completed: ${completedAt.toLocaleString()}</div>
        <div>Duration: ${formatDuration(duration)}</div>
      </div>
      <div class="status-badge">${statusText}</div>
    </div>

    <div class="content">
      <!-- Summary Metrics -->
      <div class="summary-grid">
        <div class="metric-card">
          <div class="label">Pages Discovered</div>
          <div class="value">${summary.pagesDiscovered}</div>
        </div>
        <div class="metric-card success">
          <div class="label">Pages Crawled</div>
          <div class="value">${summary.pagesCrawled}</div>
        </div>
        <div class="metric-card ${summary.pagesChanged > 0 ? 'warning' : ''}">
          <div class="label">Pages Changed</div>
          <div class="value">${summary.pagesChanged}</div>
        </div>
        <div class="metric-card">
          <div class="label">Pages New</div>
          <div class="value">${summary.pagesNew}</div>
        </div>
        <div class="metric-card ${summary.totalErrors > 0 ? 'error' : ''}">
          <div class="label">Total Errors</div>
          <div class="value">${summary.totalErrors}</div>
        </div>
      </div>

      <!-- Changed Pages -->
      ${
        changedPages.length > 0
          ? `
      <div class="section">
        <h2>⚠️ Changed Pages (${changedPages.length})</h2>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            ${changedPages
              .map((page) => {
                const changes = [];
                if (!page.prev_text_hash || page.text_hash !== page.prev_text_hash) changes.push('Text');
                if (!page.prev_headings_hash || page.headings_hash !== page.prev_headings_hash) changes.push('Headings');
                if (!page.prev_code_hash || page.code_hash !== page.prev_code_hash) changes.push('Code');
                if (!page.prev_links_hash || page.links_hash !== page.prev_links_hash) changes.push('Links');
                return `
                <tr>
                  <td class="url-cell"><a href="${page.url}" target="_blank">${page.url}</a></td>
                  <td>${page.title || 'N/A'}</td>
                  <td>${changes.map((c) => `<span class="change-badge">${c}</span>`).join(' ')}</td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      `
          : ''
      }

      <!-- New Pages -->
      ${
        newPages.length > 0
          ? `
      <div class="section">
        <h2>✨ New Pages (${newPages.length})</h2>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            ${newPages
              .map(
                (page) => `
              <tr>
                <td class="url-cell"><a href="${page.url}" target="_blank">${page.url}</a></td>
                <td>${page.title || 'N/A'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      `
          : ''
      }

      <!-- Performance -->
      ${
        perfPages.length > 0
          ? `
      <div class="section">
        <h2>⏱️ Slowest Pages</h2>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Load Time</th>
              <th>DOM Content Loaded</th>
              <th>Resources</th>
            </tr>
          </thead>
          <tbody>
            ${perfPages
              .map(
                (page) => `
              <tr>
                <td class="url-cell"><a href="${page.url}" target="_blank">${page.url}</a></td>
                <td>${page.load_ms ? Number(page.load_ms).toFixed(0) + 'ms' : 'N/A'}</td>
                <td>${page.domcontentloaded_ms ? Number(page.domcontentloaded_ms).toFixed(0) + 'ms' : 'N/A'}</td>
                <td>${page.resource_count || 0}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      `
          : ''
      }

      <!-- Errors -->
      ${
        errors.length > 0
          ? `
      <div class="section">
        <h2>❌ Error Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Error Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${errors
              .map(
                (error) => `
              <tr>
                <td>${error.error_type}</td>
                <td>${error.count}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      `
          : ''
      }

      <!-- Error URLs -->
      ${
        errorUrls.length > 0
          ? `
      <div class="section">
        <h2>🔗 Top Error URLs</h2>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Error Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${errorUrls
              .map(
                (errorUrl) => `
              <tr>
                <td class="url-cell"><a href="${errorUrl.url}" target="_blank">${errorUrl.url}</a></td>
                <td>${errorUrl.error_type}</td>
                <td>${errorUrl.error_count}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      `
          : ''
      }

      ${
        summary.pagesChanged === 0 && summary.totalErrors === 0 && newPages.length === 0
          ? `
      <div class="empty-state">
        <h3>✨ All Clear!</h3>
        <p>No changes, errors, or new pages detected in this run.</p>
      </div>
      `
          : ''
      }
    </div>

    <div class="footer">
      Generated by Playwright Docs Monitor | ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;
  }
}
