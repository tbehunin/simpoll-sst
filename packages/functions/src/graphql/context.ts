import { initContextCache } from '@pothos/core';
// import { LoadableRef, rejectErrors } from '@pothos/plugin-dataloader';
// import DataLoader from 'dataloader';
// import { loadablePoll } from './schema/interfaces/poll';
 
export interface ContextType {
  currentUserId: string;
  // pollLoader: DataLoader<string, { pollId: string }>; // expose a specific loader
  // getLoader: <K, V>(ref: LoadableRef<K, V, ContextType>) => DataLoader<K, V>; // helper to get a loader from a ref
  // load: <K, V>(ref: LoadableRef<K, V, ContextType>, id: K) => Promise<V>; // helper for loading a single resource
  // loadMany: <K, V>(ref: LoadableRef<K, V, ContextType>, ids: K[]) => Promise<(Error | V)[]>; // helper for loading many
}

 
export const context = (): ContextType => ({
  // Adding this will prevent any issues if you server implementation
  // copies or extends the context object before passing it to your resolvers
  ...initContextCache(),
  currentUserId: 'user1', // TODO: wire up from auth
 
  // using getters allows us to access the context object using `this`
  // get pollLoader() {
  //   return loadablePoll.getDataloader(this);
  // },
  // get getLoader() {
  //   return <K, V>(ref: LoadableRef<K, V, ContextType>) => ref.getDataloader(this);
  // },
  // get load() {
  //   return <K, V>(ref: LoadableRef<K, V, ContextType>, id: K) => ref.getDataloader(this).load(id);
  // },
  // get loadMany() {
  //   return async <K, V>(ref: LoadableRef<K, V, ContextType>, ids: K[]) => {
  //     const results = await ref.getDataloader(this).loadMany(ids);
  //     return rejectErrors(results);
  //   };
  // },
});
