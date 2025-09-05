import { PollParticipantMapper } from "@simpoll-sst/core/data/poll/participant/poll-participant.mapper";
import { PollParticipantMapper as DomainMapper } from "@simpoll-sst/core/services/poll/participants/poll-participant.mapper";
import { PollService } from "@simpoll-sst/core/services/poll/poll.service";
import { VoteAggregationRequest, ParsedVoteData } from "@simpoll-sst/core/services/poll/types";
import { Util } from "@simpoll-sst/core/util";
import { DynamoDBStreamEvent, DynamoDBRecord } from "aws-lambda";

export const main = Util.handler(async (event, context) => {
  const streamEvent = event as DynamoDBStreamEvent;
  
  console.log(`Processing ${streamEvent.Records.length} vote stream records`);

  // Process each record in the stream
  for (const record of streamEvent.Records) {
    try {
      // Handler owns all infrastructure translation
      const domainRequest = translateStreamToDomain(record);
      
      if (domainRequest) {
        console.log(`Processing vote for poll ${domainRequest.pollId} by user ${domainRequest.userId}`);
        
        await PollService.aggregateVote({ voteAggregation: domainRequest });
        
        console.log(`Successfully aggregated vote for poll ${domainRequest.pollId}`);
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

// Handler-layer function that translates infrastructure to domain
function translateStreamToDomain(record: DynamoDBRecord): VoteAggregationRequest | null {
  try {
    // Infrastructure validation
    if (record.eventName !== 'INSERT' && record.eventName !== 'MODIFY') {
      console.log(`Skipping ${record.eventName} event`);
      return null;
    }
    
    if (!record.dynamodb?.NewImage) {
      console.log('No NewImage found, skipping record');
      return null;
    }

    // Parse using data layer mappers (handler can import these)
    const pollParticipantEntity = PollParticipantMapper.voteStreamToPollParticipantEntity(
      record.dynamodb.NewImage
    );
    const pollParticipant = DomainMapper.toDomain(pollParticipantEntity);
    
    // Business rule check
    if (!pollParticipant.voted) {
      console.log('Participant has not voted yet, skipping aggregation');
      return null;
    }

    // Parse vote data to domain format
    const voteData: ParsedVoteData = parseVoteData(record.dynamodb.NewImage.vote);

    // Return pure domain object
    return {
      pollId: pollParticipant.pollId,
      userId: pollParticipant.userId,
      pollType: pollParticipant.type,
      scope: pollParticipant.scope,
      voteData
    };
  } catch (error) {
    console.error('Failed to translate stream record to domain:', error);
    return null;
  }
}

// Handler owns the parsing logic for vote data
function parseVoteData(rawVoteData: any): ParsedVoteData {
  // Handle the case where vote data might have selectedIndex (from DynamoDB)
  if (rawVoteData?.selectedIndex) {
    return {
      selectedChoices: Array.isArray(rawVoteData.selectedIndex)
        ? rawVoteData.selectedIndex
        : [rawVoteData.selectedIndex]
    };
  }
  
  // Handle other vote data formats as needed
  return {
    selectedChoices: []
  };
}
