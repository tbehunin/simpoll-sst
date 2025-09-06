import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { Util } from '@simpoll-sst/core/util';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { parsePollParticipant } from './stream-parser';

export const main = Util.handler(async (event, context) => {
  const streamEvent = event as DynamoDBStreamEvent;

  // Process each record in the stream
  for (const record of streamEvent.Records) {
    try {
      // Parse DynamoDB stream to PollParticipant domain object
      const participant = parsePollParticipant(record);
      
      if (participant) {
        await PollService.aggregateVote({ participant });
      }

    } catch (error) {
      console.error('Error processing vote stream record:', error);
      console.error('Record:', JSON.stringify(record, null, 2));
      // Continue processing other records even if one fails
    }
  }

  return JSON.stringify({
    statusCode: 200,
    processedRecords: streamEvent.Records.length,
    message: 'Vote aggregation completed'
  });
});
