export interface Mapper<TEntity, TDomain> {
  toDomain: (entity: TEntity) => TDomain;
  toDomainList: (entities: TEntity[]) => TDomain[];
  fromCreateRequest: (...args: any[]) => TEntity | TEntity[];
}