import { Repository } from '../../../data/repository.interface';
import { Mapper } from '../mappers/mapper.interface';

// Higher-order function that creates query functions
export const createBatchQuery = <TEntity, TDomain>(
  repository: Repository<TEntity>,
  mapper: Mapper<TEntity, TDomain>
) => async (ids: string[]): Promise<TDomain[]> => {
  const entities = await repository.batchGet(ids);
  return mapper.toDomainList(entities);
};

// Pipe utility for function composition
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);