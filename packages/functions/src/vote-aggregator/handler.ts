import { PollParticipantMapper } from "@simpoll-sst/core/data/poll/participant/poll-participant.mapper";
import { PollParticipantMapper as DomainMapper } from "@simpoll-sst/core/services/poll/participants/poll-participant.mapper";
import { PollService } from "@simpoll-sst/core/services/poll/poll.service";
import { Util } from "@simpoll-sst/core/util";
import { DynamoDBStreamEvent } from "aws-lambda";

export const main = Util.handler(async (event, context) => {
  const streamEvent = event as DynamoDBStreamEvent;
  
  console.log(`Processing ${streamEvent.Records.length} vote stream records`);

  // Process each record in the stream
  for (const record of streamEvent.Records) {
    try {
      // Only process INSERT and MODIFY events (new votes or vote updates)
      if (record.eventName !== 'INSERT' && record.eventName !== 'MODIFY') {
        console.log(`Skipping ${record.eventName} event`);
        continue;
      }

      // Skip if no new image (shouldn't happen for INSERT/MODIFY)
      if (!record.dynamodb?.NewImage) {
        console.log('No NewImage found, skipping record');
        continue;
      }

      // Parse the poll participant entity from the stream
      const pollParticipantEntity = PollParticipantMapper.voteStreamToPollParticipantEntity(record.dynamodb.NewImage);
      const pollParticipant = DomainMapper.toDomain(pollParticipantEntity);

      console.log(`Processing vote for poll ${pollParticipant.pollId} by user ${pollParticipant.userId}`);

      // Skip if this participant hasn't voted yet
      if (!pollParticipant.voted) {
        console.log('Participant has not voted yet, skipping aggregation');
        continue;
      }

      // Delegate to service layer (which uses the command)
      await PollService.aggregateVote({
        pollParticipant,
        voteStreamData: record.dynamodb.NewImage.vote
      });

      console.log(`Successfully aggregated vote for poll ${pollParticipant.pollId}`);

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
