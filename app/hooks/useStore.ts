export function useStore<T, U>(store: T, selector: (store: T) => U): U {
  return selector(store);
}
