# Simpoll SST

A serverless polling application built with SST v3, GraphQL, and DynamoDB.

## Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- An AWS account with permissions to create resources

## Development Stages

This project uses a multi-stage deployment strategy:

| Stage | Purpose | Auth Required | Command |
|-------|---------|---------------|------|
| **Personal Sandbox** (username) | Your personal experimentation environment | ❌ No | `npm run dev` |
| **dev** | Shared team development environment | ✅ Yes | `npm run dev:team` |
| **staging** | Pre-production QA testing | ✅ Yes | `npm run deploy:staging` |
| **production** | Live production environment | ✅ Yes | `npm run deploy:prod` |

### Personal Sandbox (Recommended for Daily Work)

When you run `npm run dev`, SST deploys to a stage named after your OS username (e.g., `simpoll-sst-tbehunin-*`). This is **your personal throw-away environment**:

- ✅ No authentication required (uses `DEV_USER_ID` from `.env.local`)
- ✅ Auth test page available for getting real JWT tokens
- ✅ Can be torn down anytime with `npm run remove`
- ✅ Isolated from team members' sandboxes
- ✅ Fast iteration without affecting others

### Shared Environments

**dev**, **staging**, and **production** stages require real Cognito authentication:
- Frontend team uses these for integration testing
- QA tests against staging
- End users access production

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd simpoll-sst
npm install
```

### 2. Configure Environment

Copy the `.env` file to `.env.local` and configure your development user:

```bash
cp .env .env.local
```

Edit `.env.local` and set your development user ID:

```
DEV_USER_ID=user1
```

> **Note:** `.env.local` is gitignored and will not be committed. This file is for your personal sandbox configuration.

### 3. AWS Profile Setup

Configure your AWS profile for the Simpoll project:

```bash
aws configure --profile simpoll-sst
```

Or set the profile as an environment variable:

```bash
export AWS_PROFILE=simpoll-sst
```

### 4. Start Your Personal Sandbox

Run the SST development server (deploys to your username stage):

```bash
npm run dev
```

The GraphQL API will be available at the endpoint shown in the terminal output. **No authentication required!**

### 5. Seed Data (Optional)

To populate the database with test data:

```bash
# The seed endpoint will be shown in the sst dev output
curl -X POST <seed-api-endpoint>/seed
```

### 6. Test Your API

**Personal Sandbox (No Auth):**
```bash
# Just make requests - authentication is automatic
curl -X POST <graphql-endpoint>/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ polls { id title } }"}'

# Or test as a different user
curl -X POST <graphql-endpoint>/graphql \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: user2" \
  -d '{"query": "{ polls { id title } }"}'
```

**Shared Stages (Auth Required):**

1. Visit the auth test page in your personal sandbox: `<graphql-endpoint>/auth-test`
2. Sign up and get a JWT token
3. Use the token against shared environments:

```bash
curl -X POST <shared-stage-url>/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"query": "{ polls { id title } }"}'
```

## Authentication

The application uses different authentication strategies based on the deployment stage:

### Personal Sandbox Mode (username stages)

- Uses the `DEV_USER_ID` environment variable (defaults to `user1`)
- Override per request using the `x-dev-user-id` header
- Auth test page available at `<graphql-endpoint>/auth-test`
- Example:

```bash
curl -X POST <graphql-endpoint>/graphql \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: user2" \
  -d '{"query": "{ polls { id title } }"}'
```

### Shared Stage Mode (dev, staging, production)

- Requires a JWT token from AWS Cognito
- Set the `Authorization` header with `Bearer <token>`
- Tokens are validated using the User Pool configuration
- No auth test page available (use personal sandbox to get tokens)

## Project Structure

This project uses [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) with the following packages:

### `packages/core/`

Shared business logic and domain models:

- **`handlers/`** - Poll type registry and handler implementations (e.g., multiple choice)
- **`services/`** - Business logic using command pattern with 3-phase execution (fetch context → validate → execute)
- **`data/`** - Repository pattern for DynamoDB access with entity mappers
- **`common/`** - Shared types and constants

### `packages/functions/`

Lambda function handlers:

- **`graphql/`** - GraphQL API using Yoga and Pothos
  - `schema/` - Type-safe GraphQL schema definitions
  - `context.ts` - Authentication and request context
  - `handler.ts` - Lambda entry point
- **`vote-aggregator/`** - DynamoDB Stream processor for vote aggregation
- **`seed/`** - Database seeding for development

### `packages/scripts/`

Administrative scripts that run using `sst shell` and `tsx`:

```bash
npm run shell src/example.ts
```

### `infra/`

Infrastructure as code split into logical modules:

- **`storage.ts`** - DynamoDB table with single-table design (4 GSIs)
- **`api.ts`** - API Gateway routes and environment configuration
- **`auth.ts`** - Cognito User Pool and Identity Pool

## GraphQL API

Access the GraphQL Playground at `<graphql-endpoint>/graphql` in your browser.

Example queries:

```graphql
# Create a poll
mutation CreatePoll {
  createPoll(
    input: {
      title: "Favorite Color?"
      description: "Choose your favorite"
      type: MULTIPLE_CHOICE
      scope: PUBLIC
      votePrivacy: ANONYMOUS
      details: {
        choices: [
          { label: "Red", media: [] }
          { label: "Blue", media: [] }
        ]
        multiSelect: false
      }
    }
  ) {
    pollId
    title
  }
}

# List polls
query ListPolls {
  polls {
    pollId
    title
    createdBy
    createdAt
  }
}
```

## Deployment

### Personal Sandbox (Daily Development)

```bash
# Start your personal sandbox
npm run dev

# Done for the day? Tear it down to save costs
npm run remove

# Tomorrow: Spin it back up (takes ~2-3 minutes)
npm run dev
```

### Shared Stages (Team Integration & Production)

```bash
# Deploy to shared dev environment
npm run deploy:dev

# Deploy to staging for QA
npm run deploy:staging

# Deploy to production
npm run deploy:prod
```

**Important:** Shared stages stay running and cost money. Only deploy when necessary.

## Development Workflow

1. Start your personal sandbox: `npm run dev`
2. Make changes to your code
3. SST automatically detects changes and updates your Lambda functions
4. Test using the GraphQL playground or curl (no auth needed!)
5. Commit your changes
6. Tear down when done: `npm run remove`
7. Deploy to shared stages when ready for team testing

## Environment Variables

| Variable | Used In | Description |
|----------|---------|-------------|
| `DEV_USER_ID` | Personal sandboxes | User ID for development mode (default: `user1`) |
| `SST_STAGE` | All stages | Auto-set deployment stage name |
| `IS_LOCAL` | All stages | Auto-set: `true` for personal sandboxes, `false` for shared stages |
| `USER_POOL_ID` | All stages | Auto-set Cognito User Pool ID |
| `USER_POOL_CLIENT_ID` | All stages | Auto-set Cognito Client ID |

## Available Commands

```bash
# Personal sandbox (your username stage)
npm run dev              # Start development server
npm run remove           # Tear down your personal sandbox

# Shared team environments
npm run dev:team         # Start dev stage (shared by team)
npm run deploy:dev       # Deploy to dev stage
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
npm run remove:dev       # Remove dev stage
npm run remove:staging   # Remove staging stage
```

---

Join the SST community over on [Discord](https://discord.gg/sst) and follow us on [Twitter](https://twitter.com/SST_dev).
