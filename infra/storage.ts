// Create the DynamoDB table
export const table = new sst.aws.Dynamo('PollsTable', {
  fields: {
    pk: 'string',
    sk: 'string',
    gsipk1: 'string',
    gsipk2: 'string',
    gsisk1: 'string',
    gsisk2: 'string',
  },
  primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
  globalIndexes: {
    Idx_gsipk1_gsisk1: {
      hashKey: 'gsipk1',
      rangeKey: 'gsisk1',
      projection: 'keys-only',
    },
    Idx_gsipk1_gsisk2: {
      hashKey: 'gsipk1',
      rangeKey: 'gsisk2',
      projection: 'keys-only',
    },
    Idx_gsipk2_gsisk1: {
      hashKey: 'gsipk2',
      rangeKey: 'gsisk1',
      projection: 'keys-only',
    },
    Idx_gsipk2_gsisk2: {
      hashKey: 'gsipk2',
      rangeKey: 'gsisk2',
      projection: 'keys-only',
    },
  },
});
  
  // Create an S3 bucket
export const bucket = new sst.aws.Bucket('Uploads');
