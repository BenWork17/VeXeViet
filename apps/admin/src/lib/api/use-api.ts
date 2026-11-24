'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  ApiFailure,
  ApiQuery,
  NETWORK_FAILURE,
  isAbort,
  send,
} from './client';

function serialiseQuery(query?: ApiQuery): string {
  if (!query) return '';
  return Object.keys(query)
    .filter((key) => query[key] !== undefined)
    .sort()
    .map((key) => `${key}=${String(query[key])}`)
    .join('&');
}

export type ApiResult<T> = {
  data: T | null;
  error: ApiFailure | null;
  loading: boolean;
  reload: () => void;
  status: number | null;
};

export function useApi<T>(path: string | null, query?: ApiQuery): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [loading, setLoading] = useState<boolean>(path !== null);
  const [status, setStatus] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  const key = serialiseQuery(query);
  const queryRef = useRef<ApiQuery | undefined>(query);
  queryRef.current = query;

  useEffect(() => {
    if (path === null) {
      setData(null);
      setError(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let live = true;

    setLoading(true);
    setError(null);
    setStatus(null);

    send(path, { query: queryRef.current, signal: controller.signal }, false)
      .then(({ body, status: httpStatus }) => {
        if (!live) return;
        setData(body as T);
        setStatus(httpStatus);
      })
      .catch((failure: unknown) => {
        if (!live || isAbort(failure)) return;
        if (failure instanceof ApiError) {
          setData(null);
          setError(failure.failure);
          setStatus(failure.status);
          return;
        }
        setData(null);
        setError(NETWORK_FAILURE);
        setStatus(null);
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
      controller.abort();
    };
  }, [path, key, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data, error, loading, reload, status };
}
