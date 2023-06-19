const R = require('ramda');
const rewire = require('rewire');
const fs = require('fs');
const path = require('path');

describe('Payment post route writeJSON', () => {
  it('should include writeJSON @app-js-call-write-json-payment', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const stack = routeStack('/payment', 'post') || routeStack('/services/payment', 'post');
    assert(typeof stack !== 'undefined', 'Payment post route may not exist yet.');
    assert(/writeJSON/.test(stack.handle.toString()), 'The payment post function does not include a call to `writeJSON`.');
  });
});

describe('Transfer post route writeJSON', () => {
  it('should include writeJSON @app-js-call-write-json-transfer', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    assert(typeof stack !== 'undefined', 'Transfer post route may not exist yet.');
    assert(/writeJSON/.test(stack.handle.toString()), 'The transfer post function does not include a call to `writeJSON`.');
  });
});

describe('Require `data.js` in `app.js', () => {
  it('should require `data.js` @app-js-require-data-js', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let accountData;
    let userData;
    let users;
    let accounts;
    let writeJSON;

    try {
      accountData = appModule.__get__('accountData');
      userData = appModule.__get__('userData');
    } catch (err) {
      assert(accountData === undefined, 'Have you removed the lines that read and parse the `accounts.json` file?');
      assert(userData === undefined, 'Have you removed the lines that read and parse the `users.json` file?');
    }

    try {
      users = appModule.__get__('users');
      accounts = appModule.__get__('accounts');
      writeJSON = appModule.__get__('writeJSON');
    } catch (err) {
      assert(users !== undefined, '`app.js` is not requiring `src/data` and creating a `users` const.');
      assert(accounts !== undefined, '`app.js` is not requiring `src/data` and creating an `accounts` const.');
      assert(writeJSON !== undefined, '`app.js` is not requiring `src/data` and creating a `writeJSON` const.');
    }

    assert(accounts !== undefined && typeof accounts === 'object', '`data.js` is not exporting the `accounts` object.');
    assert(users !== undefined && typeof users === 'object', '`data.js` is not exporting the `users` object.');
    assert(writeJSON !== undefined && typeof writeJSON === 'function', '`data.js` is not exporting the `writeJSON` function.');
  });
});

describe('`data.js` exists', () => {
  it('`data.js` should exist  @data-js-create-file', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/data.js')), 'The `src/data.js` file does not exist.');
  });
});

describe('`data.js` exports', () => {
  it('`data.js` should export an object @data-js-exports-data', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/data.js')), 'The `src/data.js` file does not exist.');
    let localAccounts;
    let localUsers;
    let localWriteJSON;

    try {
      const data = require('../src/data');
      localAccounts = data.accounts;
      localUsers = data.users;
      localWriteJSON = data.writeJSON;
    } catch (err) {
      assert(false, 'The `src/data.js` file does not exist.');
    }

    assert(localAccounts !== undefined && typeof localAccounts === 'object', '`data.js` is not exporting the `accounts` object.');
    assert(localUsers !== undefined && typeof localUsers === 'object', '`data.js` is not exporting the `users` object.');
    assert(localWriteJSON !== undefined && typeof localWriteJSON === 'function', '`data.js` is not exporting the `writeJSON` function.');
  });
});

describe('Require `fs` and `path` built-ins in data.js', () => {
  it('`data.js` should contain requires @data-js-require-built-ins', () => {
    let fs;
    let path;
    try {
      const dataModule = rewire('../src/data');
      fs = dataModule.__get__('fs');
      path = dataModule.__get__('path');
    } catch (err) {
      assert(fs !== undefined, 'Has the `fs` built-in module been required in `data.js`?');
      assert(path !== undefined, 'Has the `path` built-in module been required in `data.js`?');
    }
  });
});

describe('Read account data from `data.js`', () => {
  it('should read account data @data-js-transition-const-accounts', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let accounts;
    let accountData;
    try {
      const dataModule = rewire('../src/data');
      accountData = dataModule.__get__('accountData');
      accounts = dataModule.__get__('accounts');
    } catch (err) {
      assert(accountData !== undefined, 'Has the `accountData` variable been created in `data.js`?');
      assert(accounts !== undefined, 'Has the `accounts` variable been created in `data.js`?');
    }
    assert(
      !Buffer.isBuffer(accountData),
      'It is best if you specify an encoding like "utf8" when reading from a file (readFileSync function).'
    );
    const accountsFound = R.allPass([R.has('savings'), R.has('checking'), R.has('credit')]);
    assert(
      accountsFound(accounts),
      'The `accounts` variable does not contain the correct information. Check the `accounts.json` file.'
    );
  });
});

describe('Read user data from `data.js`', () => {
  it('`data.js` should read user data @data-js-transition-const-users', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let users;
    let userData;
    try {
      const dataModule = rewire('../src/data');
      userData = dataModule.__get__('userData');
      users = dataModule.__get__('users');
    } catch (err) {
      assert(userData !== undefined, 'Has the `userData` variable been created in `data.js`?');
      assert(users !== undefined, 'Has the `users` variable been created in `data.js`?');
    }
    assert(
      !Buffer.isBuffer(userData),
      'It is best if you specify an encoding like "utf8" when reading from a file (readFileSync function).'
    );
    const usersFound = R.allPass([R.has('name'), R.has('username'), R.has('phone'), R.has('email'), R.has('address')]);
    assert(usersFound(users[0]), 'The `users` variable does not contain the correct information.');
  });
});

describe('writeJSON function', () => {
  let writeFileSyncStub;
  let writeJSONSpy;

  before(() => {
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  it('`writeJSON()` should write to `accounts.json` @data-js-write-json-function-body', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/data.js')), 'The `src/data.js` file does not exist.');
    let writeJSON;
    try {
      const dataModule = rewire('../src/data');
      writeJSON = dataModule.__get__('writeJSON');
    } catch (err) {
      assert(writeJSON !== undefined, '`data.js` does not contain a function called `writeJSON`.');
    }
    assert(typeof writeJSON === 'function', '`writeJSON` is not a function.');

    writeJSONSpy = sinon.spy(writeJSON);
    writeJSONSpy();
    assert(
      writeFileSyncStub.called,
      '`writeFileSync` has not been called in your `writeJSON` function.'
    );
    assert(
      writeFileSyncStub.firstCall.args[0].includes('src/json/accounts.json'),
      'The path being passed to `writeFileSync` is incorrect.'
    );
    assert(
      typeof writeFileSyncStub.firstCall.args[1] === 'string',
      'The content being passed to `writeFileSync` is not a string.'
    );
    assert(
      writeFileSyncStub.firstCall.args[2].replace('-', '').toLowerCase() === 'utf8',
      'It is best if you encode the string as utf8'
    );
  });

  after(() => {
    writeFileSyncStub.restore();
  });
});

describe('writeJSON function in data.js', () => {
  it('`data.js` should include a writeJSON function @data-js-write-json-function', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/data.js')), 'The `src/data.js` file does not exist.');
    let writeJSON;
    try {
      const dataModule = rewire('../src/data');
      writeJSON = dataModule.__get__('writeJSON');
    } catch (err) {
      assert(writeJSON !== undefined, '`data.js` does not contain a function called `writeJSON`.');
    }
    assert(typeof writeJSON === 'function', '`writeJSON` is not a function.');
  });
});
