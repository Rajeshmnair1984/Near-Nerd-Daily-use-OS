import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/types/common';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  dependencies: React.DependencyList = []
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (err: unknown) {
      const error: ApiError = err instanceof Error
        ? { code: 'ERROR', message: err.message }
        : { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' };
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, [...dependencies]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, execute };
}
