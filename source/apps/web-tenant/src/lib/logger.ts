/**
 * Logger utility with configurable logging
 * Controlled by NEXT_PUBLIC_USE_LOGGING environment variable
 */

import { config } from './config';

const USE_LOGGING = config.useLogging;

export const logger = {
  log: (...args: any[]) => {
    if (USE_LOGGING) console.log(...args);
  },
  error: (...args: any[]) => {
    if (USE_LOGGING) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (USE_LOGGING) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (USE_LOGGING) console.info(...args);
  },
  debug: (...args: any[]) => {
    if (USE_LOGGING) console.debug(...args);
  },
};

export default logger;
