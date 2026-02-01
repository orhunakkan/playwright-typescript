import { query } from './connection.js';
import { logger } from './logger.js';
import { ContentFingerprint } from '../extractors/content.js';
import { NetworkObservation, AssetFingerprint } from '../extractors/network.js';
import { PerformanceMetricsData } from '../extractors/performance.js';
import { ErrorEvent } from '../extractors/errors.js';

export async function createRun(): Promise<string> {
  const result = await query(`INSERT INTO runs (status) VALUES ($1) RETURNING run_id`, ['running']);
  const runId = result.rows[0].run_id;
  logger.info(`Created run: ${runId}`);
  return runId;
}

export async function completRun(
  runId: string,
  pagesDiscovered: number,
  pagesCrawled: number,
  pagesChanged: number,
  pagesNew: number,
  pagesMissing: number,
  totalErrors: number,
  durationMs: number
): Promise<void> {
  await query(
    `UPDATE runs 
     SET status = $1, 
         completed_at = CURRENT_TIMESTAMP,
         total_pages_discovered = $2,
         total_pages_crawled = $3,
         pages_changed = $4,
         pages_new = $5,
         pages_missing = $6,
         total_errors = $7,
         total_duration_ms = $8
     WHERE run_id = $9`,
    ['completed', pagesDiscovered, pagesCrawled, pagesChanged, pagesNew, pagesMissing, totalErrors, durationMs, runId]
  );
  logger.info(`Completed run: ${runId}`);
}

export async function failRun(runId: string, error: string): Promise<void> {
  await query(
    `UPDATE runs 
     SET status = $1, 
         completed_at = CURRENT_TIMESTAMP,
         metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{error}', to_jsonb($2))
     WHERE run_id = $3`,
    ['failed', error, runId]
  );
  logger.error(`Failed run: ${runId}`);
}

export async function getRun(runId: string): Promise<any> {
  const result = await query('SELECT * FROM runs WHERE run_id = $1', [runId]);
  return result.rows[0];
}

export async function getLatestRun(): Promise<any> {
  const result = await query('SELECT * FROM runs WHERE status = $1 ORDER BY completed_at DESC LIMIT 1', ['completed']);
  return result.rows[0];
}

export async function upsertPage(url: string, urlSlug: string): Promise<number> {
  const result = await query(
    `INSERT INTO pages (url, url_slug) VALUES ($1, $2)
     ON CONFLICT (url) DO UPDATE SET last_checked_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [url, urlSlug]
  );
  return result.rows[0].id;
}

export async function insertPageSnapshot(runId: number, pageId: number, url: string, fingerprint: ContentFingerprint): Promise<void> {
  await query(
    `INSERT INTO page_snapshots 
     (run_id, page_id, url, title, h1_text, content_snapshot, text_hash, headings_hash, code_hash, links_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      runId,
      pageId,
      url,
      fingerprint.snapshot.title,
      fingerprint.snapshot.h1Text,
      JSON.stringify(fingerprint.snapshot),
      fingerprint.textHash,
      fingerprint.headingsHash,
      fingerprint.codeHash,
      fingerprint.linksHash,
    ]
  );
}

export async function insertNetworkObservation(runId: number, pageId: number | null, url: string, observation: NetworkObservation): Promise<void> {
  await query(
    `INSERT INTO network_observations 
     (run_id, page_id, url, total_requests, total_responses, count_2xx, count_3xx, count_4xx, count_5xx, failed_requests, top_failing_urls)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      runId,
      pageId,
      url,
      observation.totalRequests,
      observation.totalResponses,
      observation.count2xx,
      observation.count3xx,
      observation.count4xx,
      observation.count5xx,
      observation.failedRequests,
      JSON.stringify(observation.topFailingUrls),
    ]
  );
}

export async function insertPerformanceObservation(runId: number, pageId: number, url: string, metrics: PerformanceMetricsData): Promise<void> {
  await query(
    `INSERT INTO performance_observations 
     (run_id, page_id, url, domcontentloaded_ms, load_ms, first_byte_ms, resource_count, total_transfer_size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [runId, pageId, url, metrics.domcontentloadedMs, metrics.loadMs, metrics.firstByteMs, metrics.resourceCount, metrics.totalTransferSizeBytes]
  );
}

export async function insertAssetFingerprints(runId: number, pageId: number | null, assets: AssetFingerprint[]): Promise<void> {
  for (const asset of assets) {
    await query(
      `INSERT INTO asset_fingerprints 
       (run_id, page_id, asset_type, asset_url, body_hash, size_bytes, content_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [runId, pageId, asset.assetType, asset.assetUrl, asset.bodyHash, asset.sizeBytes, asset.contentType]
    );
  }
}

export async function insertErrorEvents(runId: number, pageId: number | null, errors: ErrorEvent[]): Promise<void> {
  for (const error of errors) {
    await query(
      `INSERT INTO error_events (run_id, page_id, error_type, url, message, stack_trace)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [runId, pageId, error.errorType, error.url, error.message, error.stackTrace]
    );
  }
}

export async function getPreviousSnapshot(pageId: number, beforeRunId: number): Promise<any> {
  const result = await query(
    `SELECT * FROM page_snapshots 
     WHERE page_id = $1 AND run_id < $2 
     ORDER BY run_id DESC LIMIT 1`,
    [pageId, beforeRunId]
  );
  return result.rows[0] || null;
}

export async function insertArtifact(runId: number, pageId: number | null, artifactType: string, localPath: string): Promise<void> {
  await query(
    `INSERT INTO artifacts (run_id, page_id, artifact_type, local_path)
     VALUES ($1, $2, $3, $4)`,
    [runId, pageId, artifactType, localPath]
  );
}
