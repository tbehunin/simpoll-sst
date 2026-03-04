import { Repository } from '@simpoll-sst/core/data';

interface Mapper<TEntity, TDomain> {
  fromEntity: (entity: TEntity) => TDomain;
  fromEntityList: (entities: TEntity[]) => TDomain[];
}

// Higher-order function that creates query functions
export const createBatchQuery = <TEntity, TDomain>(
  repository: Repository<TEntity>,
  mapper: Mapper<TEntity, TDomain>
) => async (ids: string[]): Promise<TDomain[]> => {
  const entities = await repository.batchGet(ids);
  return mapper.fromEntityList(entities);
};