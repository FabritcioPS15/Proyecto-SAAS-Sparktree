// Improved logging utility

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private context: string = 'APP';

  constructor(context?: string) {
    if (context) this.context = context;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setContext(context: string): void {
    this.context = context;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${metaStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level < this.level) return;

    const formatted = this.formatMessage(levelName, message, meta);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }

    // RNF-07: Centralized logging to Docker stdout
    // No file writing - all logs go to stdout for Docker log aggregation
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta);
  }

  fatal(message: string, meta?: any): void {
    this.log(LogLevel.FATAL, 'FATAL', message, meta);
  }

  // Request logging middleware
  static requestLogger(req: any, res: any, next: any): void {
    const start = Date.now();
    const logger = new Logger('HTTP');

    res.on('finish', () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      
      if (res.statusCode >= 500) {
        logger.error(message);
      } else if (res.statusCode >= 400) {
        logger.warn(message);
      } else {
        logger.info(message);
      }
    });

    next();
  }
}

// Create context-specific loggers
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Default logger
export const logger = new Logger();

// Context-specific loggers
export const apiLogger = new Logger('API');
export const dbLogger = new Logger('DB');
export const authLogger = new Logger('AUTH');
export const platformLogger = new Logger('PLATFORM');
export const assignmentLogger = new Logger('ASSIGNMENT');
export const webhookLogger = new Logger('WEBHOOK');

export default Logger;
