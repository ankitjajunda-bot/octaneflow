const fs = require('fs');
const path = require('path');
const vm = require('vm');

const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, value) => { localStorageStore[key] = String(value); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

global.sessionStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, value) => { localStorageStore[key] = String(value); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

global.db = { users: {} };
global.window = global;

global.loadScript = (filename) => {
  const filePath = path.resolve(__dirname, '../js', filename);
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInThisContext(code);
};

describe('Auth user-store merge rules', () => {
  beforeEach(() => {
    localStorage.clear();
    global.db = { users: {} };
    loadScript('auth.js');
  });

  test('deleted users remain deleted after merge and do not reappear', async () => {
    localStorage.setItem('octaneflow_users', JSON.stringify({
      mukesh: { username: 'mukesh', role: 'employee', deleted: true }
    }));
    global.db.users = { mukesh: { username: 'mukesh', role: 'employee' } };

    const users = getUsers();

    expect(users.mukesh.deleted).toBe(true);
    expect(Object.keys(users)).toContain('mukesh');
  });

  test('employee without approved device is blocked from login', async () => {
    global.db.users = {
      ramesh: {
        username: 'ramesh',
        displayName: 'Ramesh',
        role: 'employee',
        pinHash: await require('crypto').createHash('sha256').update('1234').digest('hex'),
        active: true,
        deviceId: null
      }
    };

    const result = await loginUser('ramesh', '1234');
    expect(result.success).toBe(false);
    expect(result.error).toBe('DEVICE_NOT_APPROVED');
  });
});
