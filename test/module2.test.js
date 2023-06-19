const ejs = require('ejs');
const R = require('ramda');
const rewire = require('rewire');
const fs = require('fs');
const path = require('path');

describe('Account Transactions', () => {
  it('should display account transactions @account-ejs-show-transactions', () => {
    let file;
    try {
      file = fs.readFileSync(path.join(process.cwd(), 'src/views/account.ejs'), 'utf8');
      ejs.compile(file);
    } catch (err) {
      assert(err.code !== 'ENOENT', 'The `account.ejs` view file does not exist.');
      const errorMessage = err.message.substring(0, err.message.indexOf('compiling ejs') - 1);
      assert(err.message.indexOf('compiling ejs') < -1, `${errorMessage} compiling account.ejs`);
    }
    assert(
      /<%-\s+include\(('|")transactions(\.ejs)?('|")\s*,\s*{\s*account:\s*account\s*}\s*\)(;)?\s*%>/.test(file),
      'Have you included the `transactions` view in `account.ejs`?'
    );
  });
});

describe('Checking and Credit Routes', () => {
  let creditStack;
  let checkingStack;
  let creditHandleSpy;
  let checkingHandleSpy;

  before(() => {
    creditStack = routeStack('/credit', 'get') || routeStack('/account/credit', 'get');
    if (typeof creditStack === 'undefined') {
      creditHandleSpy = { restore: () => { } };
    } else {
      creditHandleSpy = sinon.spy(creditStack, 'handle');
    }
    checkingStack = routeStack('/checking', 'get') || routeStack('/account/checking', 'get');
    if (typeof checkingStack === 'undefined') {
      checkingHandleSpy = { restore: () => { } };
    } else {
      checkingHandleSpy = sinon.spy(checkingStack, 'handle');
    }
  });

  it('should contain the credit and checking routes @app-get-other-account-routes', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const req = mockReq();
    const res = mockRes();

    assert(typeof creditHandleSpy === 'function', 'The credit get route has not been created.');
    creditHandleSpy(req, res);
    assert(res.render.called, 'The credit get route is not calling res.render.');
    assert(res.render.firstCall.args[0] === 'account', 'The credit route does not seem to be rendering the `account` view.');
    assert(typeof res.render.firstCall.args[1] === 'object', 'The credit route res.render may be missing arguments.');
    assert(
      R.has('account')(res.render.firstCall.args[1]),
      'The credit route maybe missing an object with a account key value pair.'
    );

    assert(typeof checkingHandleSpy === 'function', 'The checking get route has not been created.');
    checkingHandleSpy(req, res);
    assert(res.render.called, 'The checking get route is not calling res.render.');
    assert(res.render.firstCall.args[0] === 'account', 'The index route does not seem to be rendering the `index` view.');
    assert(typeof res.render.firstCall.args[1] === 'object', 'The checking route res.render may be missing arguments.');
    assert(
      R.has('account')(res.render.firstCall.args[1]),
      'The checking route may be missing an object with a account key value pair.'
    );
  });

  after(() => {
    creditHandleSpy.restore();
    checkingHandleSpy.restore();
  });
});

describe('app.js contains a Profile Route', () => {
  let spy;
  before(() => {
    if (typeof app === 'undefined') {
      spy = {
        restore: () => { }
      };
    } else {
      spy = sinon.spy(app, 'render');
    }
  });

  it('should contain the profile route @app-get-profile-route', done => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    request(app)
      .get('/profile')
      .expect(() => {
        assert(spy.called, 'The profile route may have not been created.');
        assert(
          spy.firstCall.args[0] === 'profile',
          'The profile route does not seem to be rendering the `profile` view.'
        );
        assert(
          R.propEq('name', 'PS User')(spy.firstCall.args[1].user),
          'The profile route may be missing a user object.'
        );
      })
      .end(done);
  });

  after(() => {
    spy.restore();
  });
});

describe('Savings Route', () => {
  let stack;
  let handleSpy;

  before(() => {
    stack = routeStack('/savings', 'get') || routeStack('/account/savings', 'get');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => {}
      };
    } else {
      handleSpy = sinon.spy(stack, 'handle');
    }
  });

  it('should contain the savings route @app-get-savings-account-route', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const req = mockReq();
    const res = mockRes();

    assert(typeof handleSpy === 'function', 'The savings get route has not been created.');
    handleSpy(req, res);
    assert(res.render.called, 'The index route may have not been created.');
    assert(
      res.render.firstCall.args[0] === 'account',
      'The savings route does not seem to be rendering the `account` view.'
    );
    assert(typeof res.render.firstCall.args[1] === 'object', 'res.render may be missing arguments');
    assert(
      R.has('account')(res.render.firstCall.args[1]),
      'The savings route may be missing an object with an account key value pair.'
    );
  });

  after(() => {
    handleSpy.restore();
  });
});

describe('Read account data', () => {
  it('should read account data @app-read-account-data', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let accounts;
    let accountData;
    try {
      if (fs.existsSync(path.join(process.cwd(), 'src/data.js'))) {
        const dataModule = rewire(path.join(process.cwd(), 'src/data.js'));
        accountData = dataModule.__get__('accountData');
        accounts = dataModule.__get__('accounts');
      } else {
        accountData = appModule.__get__('accountData');
        accounts = appModule.__get__('accounts');
      }
    } catch (err) {
      assert(accountData !== undefined, 'Has the `accountData` variable been created in `app.js`?');
      assert(accounts !== undefined, 'Has the `accounts` variable been created in `app.js`?');
    }
    assert(
      !Buffer.isBuffer(accountData),
      'It is best if you specify an encoding like "utf8" when reading from a file (readFileSync function).'
    );
    assert(typeof accounts === 'object', 'The accounts variable does not contain the correct information.');
    const accountsFound = R.allPass([R.has('savings'), R.has('checking'), R.has('credit')]);
    assert(accountsFound(accounts), 'The accounts variable does not contain the correct information. Check the accounts.json file.');
  });
});

describe('Read user data', () => {
  it('should read user data @app-read-user-data', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let users;
    let userData;
    try {
      if (fs.existsSync(path.join(process.cwd(), 'src/data.js'))) {
        const dataModule = rewire(path.join(process.cwd(), 'src/data.js'));
        userData = dataModule.__get__('userData');
        users = dataModule.__get__('users');
      } else {
        userData = appModule.__get__('userData');
        users = appModule.__get__('users');
      }
    } catch (err) {
      assert(userData !== undefined, 'Has the `userData` variable been created in `app.js`?');
      assert(users !== undefined, 'Has the `users` variable been created in `app.js`?');
    }
    assert(
      !Buffer.isBuffer(userData),
      'It is best if you specify an encoding like "utf8" when reading from a file (readFileSync function).'
    );
    assert(typeof users === 'object', 'The users variable does not contain the correct information.');
    const usersFound = R.allPass([R.has('name'), R.has('username'), R.has('phone'), R.has('email'), R.has('address')]);
    assert(usersFound(users[0]), 'The users variable does not contain the correct information.');
  });
});

describe('Updated Index Route', () => {
  let spy;
  before(() => {
    if (typeof app === 'undefined') {
      spy = {
        restore: () => { }
      };
    } else {
      spy = sinon.spy(app, 'render');
    }
  });

  it('should contain the index route with accounts @app-update-index-route', done => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    request(app)
      .get('/')
      .expect(() => {
        assert(spy.called, 'The index route may have not been created.');
        assert(spy.firstCall.args[0] === 'index', 'The index route does not seem to be rendering the `index` view.');
        assert(
          R.propEq('title', 'Account Summary')(spy.firstCall.args[1]),
          'The index route object `title` key value pair was not updated.'
        );
        const accountsObjectFound = R.allPass([R.has('savings'), R.has('checking'), R.has('credit')]);
        assert(
          accountsObjectFound(spy.firstCall.args[1].accounts),
          'The index route object may be missing an `accounts: accounts"` key value pair.'
        );
      })
      .end(done);
  });

  after(() => {
    spy.restore();
  });
});

describe('Update `index` view', () => {
  it('should update the index view with account summaries @index-ejs-update-view', () => {
    let file;
    try {
      file = fs.readFileSync(path.join(process.cwd(), 'src/views/index.ejs'), 'utf8');
      ejs.compile(file);
    } catch (err) {
      assert(err.code !== 'ENOENT', 'The `index.ejs` view file does not exist.');
      const errorMessage = err.message.substring(0, err.message.indexOf('compiling ejs') - 1);
      assert(err.message.indexOf('compiling ejs') < -1, `${errorMessage} compiling index.ejs`);
    }
    assert(/<%-\s+include\(('|")header(\.ejs)?('|")\)(;)?\s*%>/.test(file), 'Have you included the `header` view?');

    assert(
      /<div\s+class\s*=\s*("|'|\s*)container(\s*|"|')>/.test(file),
      'The `div` with a class of `container` can not be found.'
    );
    assert(/<h1>\s*<%=\s*title\s*%>\s*<\/h1>/.test(file), 'The `title` variable seems to be missing.');
    assert(
      /<a\s+href=('|")?\/profile('|")?>\s*(P|p)rofile\s*<\/a>/.test(file),
      'The `profile` link seems to be missing.'
    );
    assert(
      /<%-\s+include\(('|")summary(\.ejs)?('|")\s*,\s*{\s*account:\s*accounts.savings\s*}\s*\)(;)?\s*%>/.test(file),
      'Have you included the `summary` view for the `savings` account?'
    );
    assert(
      /<%-\s+include\(('|")summary(\.ejs)?('|")\s*,\s*{\s*account:\s*accounts.checking\s*}\s*\)(;)?\s*%>/.test(file),
      'Have you included the `summary` view for the `checking` account?'
    );
    assert(
      /<%-\s+include\(('|")summary(\.ejs)?('|")\s*,\s*{\s*account:\s*accounts.credit\s*}\s*\)(;)?\s*%>/.test(file),
      'Have you included the `summary` view for the `credit` account?'
    );
    assert(
      /<a\s+href=('|")?(\/services)?\/transfer('|")?>\s*(T|t)ransfer\s*<\/a>/.test(file),
      'The `transfer` link seems to be missing.'
    );
    assert(/<%-\s+include\(('|")footer(\.ejs)?('|")\)(;)?\s*%>/.test(file), 'Have you included the `footer` view?');
  });
});

describe('`profile.ejs` exists', () => {
  it('`profile.ejs` should exist  @profile-ejs-create-view-file', () => {
    const exists = fs.existsSync(path.join(process.cwd(), 'src/views/profile.ejs'), 'utf8');
    assert(exists, 'The `profile.ejs` view file does not exist.');
  });
});

describe('Create `profile` view', () => {
  it('should create the profile view @profile-ejs-create-view', () => {
    let file;
    try {
      file = fs.readFileSync(path.join(process.cwd(), 'src/views/profile.ejs'), 'utf8');
      ejs.compile(file);
    } catch (err) {
      assert(err.code !== 'ENOENT', 'The `profile.ejs` view file does not exist.');
      const errorMessage = err.message.substring(0, err.message.indexOf('compiling ejs') - 1);
      assert(err.message.indexOf('compiling ejs') < -1, `${errorMessage} compiling profile.ejs`);
    }
    assert(/<%-\s+include\(('|")header(\.ejs)?('|")\)(;)?\s*%>/.test(file), 'Have you included the `header` view?');
    assert(/<%=\s*user.name\s*%>/.test(file), 'The users name is not displayed.');
    assert(/<%=\s*user.username\s*%>/.test(file), 'The users username is not displayed.');
    assert(/<%=\s*user.phone\s*%>/.test(file), 'The users phone is not displayed.');
    assert(/<%=\s*user.email\s*%>/.test(file), 'The users email is not displayed.');
    assert(/<%=\s*user.address\s*%>/.test(file), 'The users address is not displayed.');
    assert(/<h1>\s*Profile\s*<\/h1>/.test(file), 'The title `<h1>` element seems to be missing.');
    assert(
      /<a\s+href=('|")?\/('|")?>(.*)<\/a>/.test(file),
      'A link to the Account Summary seems to be missing.'
    );
    assert(/<%-\s+include\(('|")footer(\.ejs)?('|")\)(;)?\s*%>/.test(file), 'Have you included the `footer` view?');
  });
});
