// middleware/globalErrorHandler.ts

import { NextFunction, Request, Response } from "express";
// import { Prisma } from '@prisma/client';
import { Prisma } from '../../generated/prisma/client';
import { logger } from '../lib/logger';

// Prisma Error Code Types
const PRISMA_ERROR_CODES = {
  // Unique constraint violation
  P2002: 'UNIQUE_CONSTRAINT',
  // Record not found
  P2025: 'RECORD_NOT_FOUND',
  // Foreign key constraint
  P2003: 'FOREIGN_KEY_CONSTRAINT',
  // Invalid value
  P2000: 'INVALID_VALUE',
  // Value too long
  P2001: 'VALUE_TOO_LONG',
  // Connection error
  P1001: 'CONNECTION_ERROR',
  // Database timeout
  P1008: 'TIMEOUT',
  // Query timeout
  P2024: 'QUERY_TIMEOUT',
} as const;

// Handle Prisma-specific errors
const handlePrismaError = (error: any): { statusCode: number; message: string; code?: string } | null => {
  // Prisma Client Known Request Error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = (error.meta as any)?.target || [];
        const field = Array.isArray(target) ? target.join(', ') : target;
        return {
          statusCode: 409,
          message: `A record with this ${field} already exists.`,
          code: 'UNIQUE_CONSTRAINT_VIOLATION'
        };
      
      case 'P2025':
        // Record not found
        return {
          statusCode: 404,
          message: 'Record not found.',
          code: 'RECORD_NOT_FOUND'
        };
      
      case 'P2003':
        // Foreign key constraint violation
        return {
          statusCode: 400,
          message: 'Invalid reference. Related record does not exist.',
          code: 'FOREIGN_KEY_VIOLATION'
        };
      
      case 'P2000':
        // Invalid value
        return {
          statusCode: 400,
          message: 'Invalid value provided.',
          code: 'INVALID_VALUE'
        };
      
      case 'P2001':
        // Value too long
        return {
          statusCode: 400,
          message: 'Value is too long for the field.',
          code: 'VALUE_TOO_LONG'
        };
      
      case 'P1001':
        // Connection error
        return {
          statusCode: 503,
          message: 'Database connection failed. Please try again later.',
          code: 'DATABASE_CONNECTION_ERROR'
        };
      
      case 'P1008':
      case 'P2024':
        // Timeout
        return {
          statusCode: 504,
          message: 'Database query timeout. Please try again.',
          code: 'DATABASE_TIMEOUT'
        };
      
      default:
        return {
          statusCode: 500,
          message: `Database error: ${error.message}`,
          code: error.code
        };
    }
  }
  
  // Prisma Client Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: 'Invalid data provided. Please check your input.',
      code: 'VALIDATION_ERROR'
    };
  }
  
  // Prisma Client Initialization Error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      statusCode: 503,
      message: 'Database connection failed. Please check your database configuration.',
      code: 'DATABASE_INITIALIZATION_ERROR'
    };
  }
  
  // Prisma Client RPC Error
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      statusCode: 500,
      message: 'Database engine error. Please contact support.',
      code: 'DATABASE_ENGINE_ERROR'
    };
  }
  
  // Generic Prisma error (check by error code string)
  if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    return {
      statusCode: 500,
      message: `Database error: ${error.message || 'Unknown database error'}`,
      code: error.code
    };
  }
  
  return null;
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    logger.error("Error after response sent", err);
    return next(err);
  }

  // Log error details
  logger.error('Error occurred', err, {
    code: err.code,
    path: req.path,
    method: req.method,
    prismaError: err instanceof Prisma.PrismaClientKnownRequestError,
  });

  // Handle Prisma errors first
  const prismaError = handlePrismaError(err);
  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      success: false,
      message: prismaError.message,
      code: prismaError.code,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.meta,
        stack: err.stack
      })
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Validation error',
      code: 'VALIDATION_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: err.errors || err.issues
      })
    });
  }

  // Handle authentication errors
  if (err.statusCode === 401 || err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: err.message || 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }

  // Handle not found errors
  if (err.statusCode === 404 || err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: err.message || 'Resource not found',
      code: 'NOT_FOUND'
    });
  }

  // Handle custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'An error occurred',
      code: err.code || 'APPLICATION_ERROR'
    });
  }

  // Default error handler
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.'
      : message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};