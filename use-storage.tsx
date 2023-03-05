import { useCallback, useMemo } from "react";
export const fakeStorage: Storage = {
  getItem(_: string) {
    return null;
  },
  setItem() {
    return undefined;
  },
  key(_: number) {
    return null;
  },
  length: 0,
  clear() {},
  removeItem(_: string) {
    return null;
  },
};

export const useStorage = <T extends Record<string, unknown>>(key: string) => {
  const storage = process.browser ? localStorage : fakeStorage;

  const get = useCallback(() => {
    const value = storage.getItem(key);

    if (value) {
      return JSON.parse(value) as Partial<T>;
    }
  }, [key, storage]);

  const set = useCallback(
    (value: Partial<T>) => {
      const currentValue = get();

      storage.setItem(key, JSON.stringify({ ...currentValue, ...value }));
    },
    [get, key, storage]
  );

  return useMemo(
    () => ({
      get,
      set,
    }),
    [get, set]
  );
};
