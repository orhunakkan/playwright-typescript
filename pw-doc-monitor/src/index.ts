import { MonitorService } from './monitor.js';
import { initDb, closeDb } from './db/connection.js';
import { migrate } from './db/migrations.js';
import { loadConfig } from './config.js';
import { logger } from './db/logger.js';

async function main() {
  try {
    const config = loadConfig();
    logger.info('Starting Playwright Docs Monitor');

    // Initialize database
    await initDb({ connectionString: config.databaseUrl });
    await migrate();

    // Run monitoring
    const monitor = new MonitorService(config);
    await monitor.run();

    logger.info('Monitoring completed successfully');
  } catch (err) {
    logger.error(`Failed to start monitor: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

main().catch((err) => {
  logger.error(`Uncaught error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
