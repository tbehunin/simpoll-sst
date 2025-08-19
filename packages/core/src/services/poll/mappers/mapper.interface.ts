export interface Mapper<TEntity, TDomain> {
  toDomainList: (entities: TEntity[]) => TDomain[];
}