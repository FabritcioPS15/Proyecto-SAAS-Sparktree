interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (error: any, attempt: number) => void;
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // No reintentar en errores de autenticación
      if ((error as any)?.message?.includes('Sesión expirada') || (error as any)?.response?.status === 401) {
        throw error;
      }

      // No reintentar en el último intento
      if (attempt === maxRetries) {
        throw error;
      }

      // Esperar antes de reintentar (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Callback de reintento
      if (onRetry) {
        onRetry(error, attempt + 1);
      }
    }
  }

  throw lastError;
};

// Wrapper para funciones de API
export const createRetryableApiCall = <T extends any[], R>(
  apiFn: (...args: T) => Promise<R>,
  defaultOptions: RetryOptions = {}
) => {
  return (...args: T): Promise<R> => {
    return withRetry(() => apiFn(...args), defaultOptions);
  };
};
