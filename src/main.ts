import { startApp } from './app.ts';
import { ConfigError, loadConfig, type Config } from './config.ts';
import { createLogger } from './logger.ts';

// Entry point for `npm start` (PLAN.md Phase 4): config → database → migrations → server on 127.0.0.1.
// Ctrl+C (SIGINT) or SIGTERM stops accepting requests, finishes open ones and closes the database.

let config: Config;
try {
  config = loadConfig(process.env);
} catch (error) {
  if (!(error instanceof ConfigError)) throw error;
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}

const logger = createLogger(config.logLevel);

function crash(msg: string) {
  return (error: unknown) => {
    logger.error(msg, { error });
    process.exit(1);
  };
}
process.on('uncaughtException', crash('uncaught exception'));
process.on('unhandledRejection', crash('unhandled rejection'));

try {
  const app = await startApp({ port: config.port, dbPath: config.dbPath, logger });
  logger.info('listening', { url: app.url, dbPath: config.dbPath });

  const stop = (signal: NodeJS.Signals) => {
    logger.info('shutting down', { signal });
    app.close().then(() => {
      logger.info('stopped');
    }, crash('shutdown failed'));
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
} catch (error) {
  crash('failed to start')(error);
}
