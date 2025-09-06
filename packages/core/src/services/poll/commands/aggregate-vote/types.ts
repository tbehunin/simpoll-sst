import { PollType } from "../../../../common/types";
import { PollParticipant } from "../../participants";

export interface AggregateVoteRequest {
  participant: PollParticipant<PollType>;
}
