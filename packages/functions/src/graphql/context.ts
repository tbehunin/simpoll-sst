import { initContextCache } from '@pothos/core';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { UnauthorizedError } from '@simpoll-sst/core/errors';
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

// Initialize JWT verifier (available in all stages for testing)
const jwtVerifier =
  process.env.USER_POOL_ID && process.env.USER_POOL_CLIENT_ID
    ? CognitoJwtVerifier.create({
        userPoolId: process.env.USER_POOL_ID,
        tokenUse: 'id',
        clientId: process.env.USER_POOL_CLIENT_ID,
      })
    : null;

async function getCurrentUserId(event: APIGatewayProxyEventV2): Promise<string> {
  const isPersonalSandbox = process.env.IS_LOCAL === 'true';
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];

  // Personal sandbox mode: smart auth handling
  if (isPersonalSandbox) {
    // If Authorization header is present, test JWT verification
    if (authHeader?.startsWith('Bearer ')) {
      console.warn('🔐 SANDBOX: Testing JWT verification...');
      const token = authHeader.substring(7);

      if (!jwtVerifier) {
        throw new UnauthorizedError('JWT verifier not initialized - check USER_POOL_ID and USER_POOL_CLIENT_ID');
      }

      try {
        const payload = await jwtVerifier.verify(token);
        const userId = (payload.sub || payload['cognito:username']) as string;
        console.warn(`✅ JWT valid! User: ${userId}`);
        return userId;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ JWT verification failed: ${errorMsg}`);
        throw new UnauthorizedError(errorMsg);
      }
    }

    // No Authorization header - use dev user (fast iteration mode)
    const devUserId = event.headers['x-dev-user-id'] || process.env.DEV_USER_ID;

    if (!devUserId) {
      throw new Error('DEV_USER_ID environment variable is required in sandbox mode');
    }

    console.warn(`🔓 SANDBOX: Using dev user ${devUserId}`);
    return devUserId;
  }

  // Shared stages (dev/staging/production): JWT required
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization header is required');
  }

  const token = authHeader.substring(7);

  if (!jwtVerifier) {
    throw new UnauthorizedError('JWT verifier not initialized - check USER_POOL_ID and USER_POOL_CLIENT_ID');
  }

  try {
    const payload = await jwtVerifier.verify(token);
    const userId = (payload.sub || payload['cognito:username']) as string;
    if (!userId) {
      throw new UnauthorizedError('No user ID found in JWT token');
    }
    return userId;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new UnauthorizedError(`JWT verification failed: ${errorMsg}`);
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
