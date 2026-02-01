export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    console.log(`[INFO] [${this.context}] ${message}`, data || '');
  }

  error(message: string, error?: Error | any): void {
    console.error(`[ERROR] [${this.context}] ${message}`, error || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] [${this.context}] ${message}`, data || '');
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] [${this.context}] ${message}`, data || '');
    }
  }
}
