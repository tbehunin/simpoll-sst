import { pollVotersDao } from "@simpoll-sst/core/data/pollVotersDao";
import { Util } from "@simpoll-sst/core/util";
import { DynamoDBStreamEvent } from "aws-lambda";

// interface Foo {
//   Records:
// }
export const main = Util.handler(async (event, context) => {
  (<DynamoDBStreamEvent>event).Records.forEach(record => {
    const voterDoc = pollVotersDao.parseStreamImage(record.dynamodb?.NewImage ?? {});
    
  });

  // 1. Get the type from the event object
  // 2. Get the correct handler based on the type
  // 3. Use the handler to deserialize the pollVote
  // 4. *** Get the pollDetails doc from the pollId in the pollVote doc
  //    - Will need to know if the poll is public or private
  //.   - Could possibly remove this call if the pollVote doc has the pollScope value
  // 5. *** Get the pollResult doc from the pollId in the pollVote doc
  //    - Could possibly remove this call if we are able to just update the pollResults doc directly
  // 6. *** Update the poll results with the new vote
  //    - bump the totalVotes count
  //    - update the results object with counts and userIds (if applicable)

  // const polls = await pollService.getPollResultsByIds([event.Records[0].dynamodb.NewImage]);


  // In the pollResults doc:
  // - Need to bump the totalVotes count
  // - Need to update the results object
  //   - Will need to know if the poll is public or private
  console.log('*************** event ***************', JSON.stringify(event, null, 2));
  console.log('***************context ***************', JSON.stringify(context, null, 2));
  return "Hello, world!";
});
