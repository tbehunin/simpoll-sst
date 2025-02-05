export enum PollType {
  MultipleChoice = 'MultipleChoice',
  Rank = 'Rank',
  Rate = 'Rate',
  OpenText = 'OpenText',
  Street = 'Street',
};

export enum RoleType {
  Author = 'Author',
  Voter = 'Voter',
};

export enum PollScope {
  Public = 'Public',
  Private = 'Private',
};

export enum PollStatus {
  Open = 'Open',
  Closed = 'Closed',
};

export enum VotePrivacy {
  Anonymous = 'Anonymous',
  Open = 'Open',
  Private = 'Private',
};

export enum MediaType {
  Video = 'Video',
  Image = 'Image',
  Giphy = 'Giphy',
};
