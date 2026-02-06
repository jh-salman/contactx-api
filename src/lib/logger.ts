// lib/logger.ts
// Pino logger - Fast, production-ready JSON logger for Node.js

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create Pino logger configuration
const loggerConfig: pino.LoggerOptions = {
  // Log level: 'debug' | 'info' | 'warn' | 'error'
  // Can be overridden with LOG_LEVEL environment variable
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Base logger configuration
  base: {
    env: process.env.NODE_ENV,
  },
  
  // Formatters
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  
  // Serializers for errors, requests, responses
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
};

// Add transport only in development (pretty printing)
if (isDevelopment) {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{msg}',
      errorLikeObjectKeys: ['err', 'error'],
    }
  };
}

// Create Pino logger instance
const pinoLogger = pino(loggerConfig);

// Wrapper class to maintain compatibility with existing API
// This allows us to use Pino while keeping the same interface
// Pino API: logger.info({ data }, 'message') - data first, message second
// Our API: logger.info('message', data) - message first, data second
class Logger {
  info(message: string, data?: any) {
    // Pino expects: logger.info(object, message)
    if (data && typeof data === 'object') {
      pinoLogger.info(data, message);
    } else if (data) {
      // If data is not an object, wrap it
      pinoLogger.info({ data }, message);
    } else {
      // No data, just message
      pinoLogger.info(message);
    }
  }

  warn(message: string, data?: any) {
    if (data && typeof data === 'object') {
      pinoLogger.warn(data, message);
    } else if (data) {
      pinoLogger.warn({ data }, message);
    } else {
      pinoLogger.warn(message);
    }
  }

  error(message: string, error?: Error | any, data?: any) {
    // Handle error object properly for Pino
    // Pino expects: logger.error({ err: Error, ...data }, 'message')
    if (error instanceof Error) {
      // Error is an Error instance
      if (data && typeof data === 'object') {
        pinoLogger.error({ err: error, ...data }, message);
      } else if (data) {
        pinoLogger.error({ err: error, data }, message);
      } else {
        pinoLogger.error({ err: error }, message);
      }
    } else if (error) {
      // Error is not an Error instance, treat as data
      if (data && typeof data === 'object') {
        pinoLogger.error({ ...error, ...data }, message);
      } else if (data) {
        pinoLogger.error({ ...error, data }, message);
      } else {
        pinoLogger.error(error, message);
      }
    } else {
      // No error, just message and data
      if (data && typeof data === 'object') {
        pinoLogger.error(data, message);
      } else if (data) {
        pinoLogger.error({ data }, message);
      } else {
        pinoLogger.error(message);
      }
    }
  }

  debug(message: string, data?: any) {
    // Debug only in development
    if (isDevelopment) {
      if (data && typeof data === 'object') {
        pinoLogger.debug(data, message);
      } else if (data) {
        pinoLogger.debug({ data }, message);
      } else {
        pinoLogger.debug(message);
      }
    }
  }
}

// Export logger instance with same API as before
export const logger = new Logger();

// Also export the raw Pino logger for advanced usage
export { pinoLogger };
