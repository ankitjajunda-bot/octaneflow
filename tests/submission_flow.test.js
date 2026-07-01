require('./setup');

beforeAll(() => {
  loadScript('submission_flow.js');
});

describe('Submission flow reliability helpers', () => {
  beforeEach(() => {
    global.db = {
      pending_entries: [],
      daily_ledger: [],
      stock: { petrol: 0, diesel: 0 },
      users: []
    };
  });

  test('buildPendingSubmissionEntry creates a durable submission envelope', () => {
    const entry = buildPendingSubmissionEntry({
      session: { username: 'emp1', displayName: 'Employee One' },
      submissionType: 'closing',
      entryData: { date: '2026-07-01', shift: 'day' },
      deviceId: 'device-123'
    });

    expect(entry.id).toBeTruthy();
    expect(entry.status).toBe('queued');
    expect(entry.submission_fingerprint).toBeTruthy();
    expect(entry.locally_saved_at).toBeTruthy();
    expect(entry._dirty).toBe(true);
  });

  test('findDuplicateSubmission detects an identical pending submission', () => {
    const first = buildPendingSubmissionEntry({
      session: { username: 'emp1', displayName: 'Employee One' },
      submissionType: 'closing',
      entryData: { date: '2026-07-01', shift: 'day' },
      deviceId: 'device-123'
    });
    global.db.pending_entries.push(first);

    const duplicate = findDuplicateSubmission({
      submissionType: 'closing',
      entryData: { date: '2026-07-01', shift: 'day' },
      submittedBy: 'emp1'
    });

    expect(duplicate).toBeDefined();
    expect(duplicate.id).toBe(first.id);
  });

  test('getSubmissionDisplayStatus returns a readable status for the UI', () => {
    expect(getSubmissionDisplayStatus({ status: 'queued' })).toBe('Queued');
    expect(getSubmissionDisplayStatus({ status: 'pending' })).toBe('Pending Approval');
    expect(getSubmissionDisplayStatus({ status: 'approved' })).toBe('Approved');
    expect(getSubmissionDisplayStatus({ status: 'rejected' })).toBe('Rejected');
  });
});
