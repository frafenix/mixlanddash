/**
 * Sistema di logging robusto per l'applicazione
 * Supporta diversi livelli di log e formattazione
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {
    // Imposta il livello di log basato sull'ambiente
    if (typeof window !== 'undefined') {
      const isDev = process.env.NODE_ENV === 'development';
      this.logLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Mantieni solo gli ultimi maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const levelStr = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${levelStr}${contextStr}: ${message}`;
  }

  public debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: LogLevel.DEBUG,
      message,
      context,
      data,
    };

    this.addLog(entry);
    console.debug(this.formatMessage(LogLevel.DEBUG, message, context), data || '');
  }

  public info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: LogLevel.INFO,
      message,
      context,
      data,
    };

    this.addLog(entry);
    console.info(this.formatMessage(LogLevel.INFO, message, context), data || '');
  }

  public warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: LogLevel.WARN,
      message,
      context,
      data,
    };

    this.addLog(entry);
    console.warn(this.formatMessage(LogLevel.WARN, message, context), data || '');
  }

  public error(message: string, context?: string, error?: Error | any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level: LogLevel.ERROR,
      message,
      context,
      data: error,
      stack: error instanceof Error ? error.stack : undefined,
    };

    this.addLog(entry);
    console.error(this.formatMessage(LogLevel.ERROR, message, context), error || '');
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Istanza singleton del logger
const logger = Logger.getInstance();

// Funzioni di utilità per un uso più semplice
export const logDebug = (message: string, context?: string, data?: any) => 
  logger.debug(message, context, data);

export const logInfo = (message: string, context?: string, data?: any) => 
  logger.info(message, context, data);

export const logWarn = (message: string, context?: string, data?: any) => 
  logger.warn(message, context, data);

export const logError = (message: string, context?: string, error?: Error | any) => 
  logger.error(message, context, error);

export default logger;