import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UseFetch<T, U extends any[] = any[]> = {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  call: (...params: U) => Promise<T>;
  resetData: () => void;
  resetError: () => void;
};

export const useFetch = <T, U extends any[] = any[]>(
  requestFn: (...params: U) => Promise<T>
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();

  // setState is async, so "callIfPristine" will call more than once
  const justInvoked = useRef(false);

  const resetData = useCallback(() => {
    setData(undefined);
  }, [setData]);

  const resetError = useCallback(() => {
    setError(undefined);
  }, [setError]);

  const call = useCallback(
    (...params: U) => {
      justInvoked.current = true;
      setLoading(true);
      resetError();

      return requestFn(...params)
        .then((data) => {
          setData(data);

          resetError();

          return data;
        })
        .catch((error: Error) => {
          setError(error.message);
          resetData();

          throw error;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [requestFn, resetData, resetError]
  );

  const callIsPristine = useCallback(
    (...params: U) => {
      if (data === undefined && !loading && !justInvoked.current) {
        return call(...params);
      }
    },
    [call, data, loading]
  );

  useEffect(() => {
    justInvoked.current = false;
  }, [loading]);

  return useMemo(() => {
    return {
      data,
      error,
      loading,
      call,
      callIsPristine,
      resetData,
      resetError,
    };
  }, [call, data, error, loading, resetData, resetError]);
};
