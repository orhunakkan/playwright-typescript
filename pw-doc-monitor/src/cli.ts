import { Command } from 'commander';
import { initDb, closeDb } from './db/connection.js';
import { migrate } from './db/migrations.js';
import { loadConfig } from './config.js';
import { logger } from './db/logger.js';
import { MonitorService } from './monitor.js';
import { Reporter } from './reporter.js';
import { DocsCrawler } from './crawler/crawler.js';

const program = new Command();

program.name('pw-doc-monitor').description('Playwright Docs Observability Monitor').version('1.0.0');

// Database migration command
program
  .command('db:migrate')
  .description('Run database migrations')
  .action(async () => {
    try {
      const config = loadConfig();
      const db = await initDb({ connectionString: config.databaseUrl });
      await migrate();
      await closeDb();
      logger.info('Migrations completed');
      process.exit(0);
    } catch (err) {
      logger.error(`Migration failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Monitor crawl command
program
  .command('monitor:crawl')
  .description('Discover and list all docs pages')
  .option('--max-pages <number>', 'Maximum pages to crawl', '500')
  .option('--concurrency <number>', 'Concurrent pages', '3')
  .action(async (options: any) => {
    try {
      const config = loadConfig();
      const crawler = new DocsCrawler(config);
      await crawler.init();

      const pages = await crawler.crawl({
        maxPages: parseInt(options.maxPages),
        concurrency: parseInt(options.concurrency),
      });

      console.log(`\nDiscovered ${pages.length} pages:\n`);
      for (const page of pages) {
        console.log(`- ${page.url}`);
      }

      await crawler.close();
      process.exit(0);
    } catch (err) {
      logger.error(`Crawl failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Monitor run command
program
  .command('monitor:run')
  .description('Run full monitoring pass')
  .action(async () => {
    try {
      const config = loadConfig();
      await initDb({ connectionString: config.databaseUrl });
      await migrate();

      const monitor = new MonitorService(config);
      await monitor.run();

      await closeDb();
      logger.info('Monitor run completed successfully');
      process.exit(0);
    } catch (err) {
      logger.error(`Monitor run failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Report latest command
program
  .command('report:latest')
  .description('Generate latest run report')
  .action(async () => {
    try {
      const config = loadConfig();
      await initDb({ connectionString: config.databaseUrl });

      const reporter = new Reporter();
      const report = await reporter.reportLatest();
      console.log('\n' + report + '\n');

      await closeDb();
      process.exit(0);
    } catch (err) {
      logger.error(`Report generation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Report diff command
program
  .command('report:diff')
  .description('Generate diff report between two runs')
  .requiredOption('--from <run-id>', 'Starting run ID')
  .requiredOption('--to <run-id>', 'Ending run ID')
  .action(async (options: any) => {
    try {
      const config = loadConfig();
      await initDb({ connectionString: config.databaseUrl });

      const reporter = new Reporter();
      const report = await reporter.reportDiff(options.from, options.to);
      console.log('\n' + report + '\n');

      await closeDb();
      process.exit(0);
    } catch (err) {
      logger.error(`Report generation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Report page command
program
  .command('report:page')
  .description('Generate history report for a page')
  .requiredOption('--url <url>', 'Page URL')
  .option('--limit <number>', 'Number of snapshots to show', '10')
  .action(async (options: any) => {
    try {
      const config = loadConfig();
      await initDb({ connectionString: config.databaseUrl });

      const reporter = new Reporter();
      const report = await reporter.reportPage(options.url, parseInt(options.limit));
      console.log('\n' + report + '\n');

      await closeDb();
      process.exit(0);
    } catch (err) {
      logger.error(`Report generation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Report HTML command
program
  .command('report:html')
  .description('Generate HTML report for latest or specific run')
  .option('--run-id <run-id>', 'Specific run ID (default: latest)')
  .action(async (options: any) => {
    try {
      const config = loadConfig();
      await initDb({ connectionString: config.databaseUrl });

      const reporter = new Reporter();
      const reportPath = await reporter.generateHtmlReport(options.runId);
      console.log(`\nHTML report generated: ${reportPath}\n`);

      await closeDb();
      process.exit(0);
    } catch (err) {
      logger.error(`HTML report generation failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
