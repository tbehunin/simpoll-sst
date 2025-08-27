export interface Repository<T> {
  get: (id: string) => Promise<T>;
  batchGet: (ids: string[]) => Promise<T[]>;
}