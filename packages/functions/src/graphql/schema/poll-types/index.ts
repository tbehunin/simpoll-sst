export * from './registry';

// Each import below runs the handler's registerGraphQLPollType() call at module load time.
// To add a new poll type, create a new file and add its import here.
import './multiple-choice.graphql';
