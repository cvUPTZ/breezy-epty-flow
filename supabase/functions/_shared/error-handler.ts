// Error handling utility for edge functions

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export function handleError(error: unknown): ErrorResponse {
  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack
    };
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; code?: string };
    return {
      error: err.message || 'An unknown error occurred',
      code: err.code
    };
  }
  
  return {
    error: String(error) || 'An unexpected error occurred'
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string };
    return err.message || 'An unknown error occurred';
  }
  
  return String(error) || 'An unexpected error occurred';
}
