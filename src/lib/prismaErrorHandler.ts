// lib/prismaErrorHandler.ts (new file)

// import { Prisma } from '@prisma/client';
import { Prisma } from '../../generated/prisma/client';

export const isPrismaError = (error: any): boolean => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    (error.code && typeof error.code === 'string' && error.code.startsWith('P'))
  );
};

export const getPrismaErrorMessage = (error: any): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return 'This record already exists.';
      case 'P2025':
        return 'Record not found.';
      case 'P2003':
        return 'Invalid reference.';
      default:
        return error.message;
    }
  }
  return error.message || 'Database error occurred.';
};