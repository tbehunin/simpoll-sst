import { initContextCache } from '@pothos/core';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
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

// Initialize JWT verifier for production
let jwtVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;
if (process.env.SST_STAGE === 'production' && process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID) {
  jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: 'id',
    clientId: process.env.COGNITO_CLIENT_ID,
  });
}

async function getCurrentUserId(event: APIGatewayProxyEventV2): Promise<string> {
  const stage = process.env.SST_STAGE || 'dev';

  // Development mode: use DEV_USER_ID with optional header override
  if (stage === 'dev') {
    const devUserId = process.env.DEV_USER_ID;
    if (!devUserId) {
      throw new Error('DEV_USER_ID environment variable is required in dev mode');
    }

    // Allow header override for multi-user testing
    const headerUserId = event.headers['x-dev-user-id'];
    return headerUserId || devUserId;
  }

  // Production mode: verify JWT token
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    throw new Error('Invalid authorization header format');
  }

  if (!jwtVerifier) {
    throw new Error('JWT verifier not initialized');
  }

  try {
    const payload = await jwtVerifier.verify(token);
    const userId = (payload.sub || payload['cognito:username']) as string;
    if (!userId) {
      throw new Error('No user ID found in JWT token');
    }
    return userId;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const context = async (serverContext: { event: APIGatewayProxyEventV2 }): Promise<ContextType> => {
  const currentUserId = await getCurrentUserId(serverContext.event);

  return {
    // Adding this will prevent any issues if you server implementation
    // copies or extends the context object before passing it to your resolvers
    ...initContextCache(),
    currentUserId,
 
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
  };
};
