import type { CodegenConfig } from '@graphql-codegen/cli';
 
const config: CodegenConfig = {
  schema: './src/graphql-api/schema.ts',
  generates: {
    './src/graphql-api/schema-types.ts': {
      config: {
        useIndexSignature: true,
      },
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  watch: true,
  overwrite: true,
};
export default config;