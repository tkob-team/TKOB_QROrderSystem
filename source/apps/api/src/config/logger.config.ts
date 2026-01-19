import * as fs from 'fs';
import * as path from 'path';
import { ConsoleLogger } from '@nestjs/common';

/**
 * Custom File Logger
 * Extends NestJS ConsoleLogger và ghi thêm vào file
 * Console vẫn giữ nguyên format và màu sắc của NestJS
 */
export class FileLogger extends ConsoleLogger {
  private logsDir: string;

  constructor() {
    super();
    
    // Ensure logs directory exists
    this.logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // Clear log files khi restart backend (ghi mới từ đầu)
    const logFiles = ['combined.log', 'app.log', 'error.log', 'warn.log'];
    logFiles.forEach(file => {
      const filePath = path.join(this.logsDir, file);
      fs.writeFileSync(filePath, ''); // Truncate file về empty
    });
  }

  private writeToFile(level: string, message: string) {
    try {
      // Write to combined log
      const combinedPath = path.join(this.logsDir, 'combined.log');
      fs.appendFileSync(combinedPath, message + '\n');

      // Write to specific log file
      if (level === 'error') {
        const errorPath = path.join(this.logsDir, 'error.log');
        fs.appendFileSync(errorPath, message + '\n');
      } else if (level === 'warn') {
        const warnPath = path.join(this.logsDir, 'warn.log');
        fs.appendFileSync(warnPath, message + '\n');
      } else {
        const appPath = path.join(this.logsDir, 'app.log');
        fs.appendFileSync(appPath, message + '\n');
      }
    } catch (err) {
      // Silently fail to avoid breaking the app
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    const formatted = this.formatLogMessage('LOG', message, context);
    this.writeToFile('log', formatted);
  }

  error(message: any, stackOrContext?: string, context?: string) {
    super.error(message, stackOrContext, context);
    const formatted = this.formatLogMessage('ERROR', message, context || stackOrContext);
    this.writeToFile('error', formatted);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    const formatted = this.formatLogMessage('WARN', message, context);
    this.writeToFile('warn', formatted);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    if (process.env.NODE_ENV !== 'production') {
      const formatted = this.formatLogMessage('DEBUG', message, context);
      this.writeToFile('debug', formatted);
    }
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    if (process.env.NODE_ENV !== 'production') {
      const formatted = this.formatLogMessage('VERBOSE', message, context);
      this.writeToFile('verbose', formatted);
    }
  }

  private formatLogMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toLocaleString('en-US');
    const pid = process.pid;
    const contextStr = context ? `[${context}] ` : '';
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    // Format: [Nest] 4508  - 01/19/2026, 12:20:31 AM   LOG [Context] Message
    return `[Nest] ${pid}  - ${timestamp}   ${level} ${contextStr}${messageStr}`;
  }
}

