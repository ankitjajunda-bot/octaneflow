# Product Reliability and Execution Plan

## Product Objective
This product must be treated as a mission-critical operations system for fuel station management. The primary objective is not feature expansion, but operational trust.

The non-negotiables are:
- zero data loss
- zero silent failure
- zero incorrect ledger posting
- fast and reliable employee submission
- robust offline/online behavior
- complete auditability and recoverability

## Core Product Principle
Every critical action must be:
1. validated
2. durably stored locally
3. acknowledged immediately
4. synchronized safely
5. posted only through a controlled, auditable workflow

## Success Definition
The app should behave as if it were built and operated by a high-caliber team of senior engineers, QA engineers, product managers, and operations staff.

### Expected behavior
- Employee submissions complete quickly and reliably from mobile devices.
- Offline submissions are captured safely and retried automatically.
- Sync recovery works without duplicate posting.
- Owners can clearly see the lifecycle of each submission.
- Ledger posting is only done through validated and approved flows.
- The system is recoverable after browser crash, storage issue, network drop, or sync failure.

### Unacceptable behavior
- silent success with no durable record
- duplicate posting
- unclear approval state
- hidden sync failure
- bad ledger data without visible explanation
- fragile behavior that depends on perfect network conditions

## Strategic Direction
The current app has a strong foundation, but the critical write path must be treated as a protected business workflow rather than just a UI action.

### Recommended architecture approach
Use a hybrid model:
- browser remains the client experience
- critical write path should be backed by a small backend or serverless layer for validation, idempotency, and safe posting
- local storage remains the offline-first buffer
- sync remains the transport and recovery layer

### Why this is necessary
This is required for:
- safe posting
- conflict handling
- auditability
- stronger integrity checks
- recoverability during failures

## Implementation Plan by Priority

### Priority 1 — Make the submission workflow atomic and trustworthy
#### Goal
Employee submissions must behave like protected business transactions.

#### Implementation details
- Introduce a formal submission lifecycle with explicit states:
  - draft
  - queued
  - syncing
  - pending_approval
  - approved
  - rejected
  - posted
  - failed
  - conflicted
- Every submission should receive:
  - unique ID
  - submission fingerprint
  - timestamp
  - device ID
  - submission version
  - immutable payload hash
- The UI must not claim success without durable storage and acknowledgment.

#### Failure modes
- double submission
- lost network after click
- refresh during submission
- duplicate sync
- stale local state
- partial save

#### Test plan
- double-click submit
- network drop immediately after submit
- browser refresh during pending state
- reopen app during sync
- retry same submission repeatedly
- verify that only one durable record exists

#### Acceptance criteria
- one submission creates one durable record
- the status is always visible
- retries do not duplicate data
- refresh or reopen never loses the submission state

### Priority 2 — Make local persistence safe and recoverable
#### Goal
The system must survive browser crashes, restarts, storage issues, and reconnects without data loss.

#### Implementation details
- Implement a durable local queue for pending operations
- Persist a submission before showing success to the user
- Store retry metadata: createdAt, lastAttemptAt, attemptCount, status, payload, checksum
- Keep a backup copy before destructive operations
- Preserve the last known good state before approval or posting
- Validate that the persisted payload is complete before it is accepted

#### Failure modes
- localStorage quota exceeded
- browser clears storage
- data corruption
- app crash mid-write
- stale state after restore

#### Test plan
- near-quota storage test
- abrupt browser close immediately after submit
- corrupt local payload and verify recovery logic
- restart the app and verify queue replay
- multiple pending items recovery flow
- backup restore workflow

#### Acceptance criteria
- pending items survive app close and reopen
- recovery resumes automatically
- corrupt records are isolated and visible

### Priority 3 — Make sync robust, fast, and idempotent
#### Goal
Sync must be fast and trustworthy, even under weak or intermittent network conditions.

#### Implementation details
- Introduce queue-based sync with retry backoff and recovery
- Each critical request must be idempotent
- Use unique operation IDs and server-side deduplication checks
- Never assume sync succeeded without confirmation
- Avoid optimistic success for ledger-critical operations

#### Failure modes
- network timeout
- duplicate requests
- partial server write
- race condition between devices
- out-of-order sync events

#### Test plan
- drop network during sync
- timeout the server request
- replay the same request twice
- two devices submit the same record simultaneously
- out-of-order sync arrival
- verify no duplicate posting occurs

#### Acceptance criteria
- a submission is either synced once or retried safely without duplicate posting
- status is explicit
- recovery resumes automatically after reconnect

### Priority 4 — Harden approval and posting flow
#### Goal
The owner must never accidentally or ambiguously post invalid or conflicting data.

#### Implementation details
- Treat approval as a controlled state transition
- Posting to the ledger must require:
  - validated payload
  - approved status
  - checksum verification
  - business rule validation
- Reject conflicting or inconsistent entries before posting

#### Business safeguards
- no future-date postings
- no invalid numbers
- no impossible meter readings
- no approval without a matching submission
- no overwrite of already posted records

#### Failure modes
- approval race
- duplicate approval
- posting to the wrong date
- overwrite of existing ledger rows
- mismatch between employee input and posted ledger

#### Test plan
- approve same item twice
- approve while another device is also approving
- submit invalid or partial payloads
- verify conflict handling with existing ledger rows
- inspect audit trail after approval

#### Acceptance criteria
- a record cannot be posted twice
- invalid or conflicting data is blocked clearly
- every approval transition is logged

### Priority 5 — Make correctness explicit and explainable
#### Goal
Users must be able to trust the numbers, not just the appearance of the interface.

#### Implementation details
- Show calculation breakdowns for:
  - litres sold
  - revenue
  - collections
  - variance
  - stock impact
- Show the exact source of values used
- Show whether values are system-default or manually overridden
- Show why a submission was rejected or flagged

#### Failure modes
- wrong formula
- wrong price lookup
- hidden assumptions
- user misunderstanding of the numbers

#### Test plan
- compare calculated values against known reference cases
- verify edge values such as zero and negative input
- validate manual override logic
- verify historical price retrieval

#### Acceptance criteria
- every key calculation can be explained and reproduced
- the app surfaces invalid assumptions before they become data

### Priority 6 — Build QA and test strategy around real failure cases
#### Goal
Reliability must be proven through testing, not assumed.

#### Testing layers
1. Unit tests
   - business rules
   - validation rules
   - formulas
   - state transitions
2. Integration tests
   - local persistence
   - queue replay
   - sync retry
   - approval transitions
   - ledger posting flow
3. End-to-end tests
   - employee submission from start to finish
   - owner approval and posting
   - offline to online recovery
   - recovery after refresh and restart
4. Failure injection tests
   - network drop
   - service timeout
   - invalid payload
   - duplicate request
   - partial save
   - storage exhaustion
5. Manual operational rehearsal
   - two-device workflow
   - weak network test
   - phone and desktop test
   - owner and employee role test

#### Failure modes
- hidden regression in core workflow
- untested edge cases
- sync or posting bug only appearing under real-world conditions

#### Acceptance criteria
- no data-loss scenarios remain in test
- no duplicate postings remain in test
- all critical flows are covered
- rollback is validated

### Priority 7 — Build operational monitoring and recovery
#### Goal
If something fails, the system must expose it and allow recovery.

#### Implementation details
- add structured logs for:
  - submissions
  - sync attempts
  - approvals
  - posting events
  - errors
  - retries
- add visible error states for the user
- add a recovery tool to replay pending queue or quarantine failed items
- add owner-visible status indicators

#### Failure modes
- no visibility into failed operations
- stuck queue item
- silent background failure

#### Test plan
- force a failure and verify it is visible
- test the recovery tool
- verify the system resumes correctly

#### Acceptance criteria
- every failed operation is visible and recoverable
- no critical action ends in an ambiguous state

### Priority 8 — Release discipline and rollback plan
#### Goal
Deployment must be safe and reversible.

#### Implementation details
- use staging before production changes
- maintain a backup before schema or data migration
- perform a release checklist for critical flows
- prepare rollback steps for bad deployments

#### Failure modes
- deployment breaks the core workflow
- bad data migration
- sync change causes duplicate or missing items

#### Test plan
- pre-release checklist
- rollback drill
- backup restore drill

#### Acceptance criteria
- release can be rolled back safely
- critical flows are validated before go-live

## Risk Register

### Risk 1: Historical data inconsistencies
- Impact: high
- Likelihood: high
- Mitigation: treat historical repair as a defined migration effort with manual review where needed

### Risk 2: Over-automation
- Impact: high
- Likelihood: medium
- Mitigation: keep automation advisory and require review for critical ledger changes

### Risk 3: Sync complexity
- Impact: high
- Likelihood: medium
- Mitigation: keep local-first behavior and add conflict detection and idempotency

### Risk 4: Feature bloat
- Impact: medium
- Likelihood: high
- Mitigation: focus on reliability before expanding features

### Risk 5: Backend dependency too early
- Impact: medium
- Likelihood: medium
- Mitigation: introduce a minimal backend or serverless layer only when required for integrity and reliability

## Recommended Priority Order
1. Submission lifecycle and durability
2. Local persistence and recovery
3. Sync correctness and idempotency
4. Approval and ledger posting safety
5. Auditability and visibility
6. QA and failure injection
7. Release discipline and rollback

## Final Recommendation
The app should be built around reliability first, feature expansion second. If the business priority is to work without failure and preserve safe data, then the real strategy is to harden the workflow until every critical action is:
- safe
- visible
- recoverable
- auditable
- fast
