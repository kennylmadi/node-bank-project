const ejs = require('ejs');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

describe('Transfer get route', () => {
  let stack;
  let handleSpy;

  before(() => {
    stack = routeStack('/transfer', 'get') || routeStack('/services/transfer', 'get');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => {}
      };
    } else {
      handleSpy = sinon.spy(stack, 'handle');
    }
  });

  it('should contain the get transfer route @app-get-transfer-route', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const req = mockReq();
    const res = mockRes();
    assert(typeof handleSpy === 'function', 'The transfer get route may not exist yet.');
    handleSpy(req, res);
    assert(res.render.called, 'The transfer post route may have not been created.');
  });

  after(() => {
    handleSpy.restore();
  });
});

describe('Payment Feature', () => {
  let getStack;
  let getHandleSpy;
  let postStack;
  let postHandleOriginal;
  let postHandleSpy;
  let writeFileSyncStub;

  before(() => {
    getStack = routeStack('/payment', 'get') || routeStack('/services/payment', 'get');
    if (typeof getStack === 'undefined') {
      getHandleSpy = { restore: () => {} };
    } else {
      getHandleSpy = sinon.spy(getStack, 'handle');
    }
    postStack = routeStack('/payment', 'post') || routeStack('/services/payment', 'post');
    if (typeof postStack === 'undefined') {
      postHandleSpy = { restore: () => {} };
    } else {
      postHandleOriginal = postStack.handle;
      postHandleSpy = sinon.spy(postStack, 'handle');
    }
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  it('should contain payment feature @app-payment-feature', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');

    assert(typeof getHandleSpy === 'function', 'The payment get route may not exist.');
    const getReq = mockReq({});
    const getRes = mockRes();
    getHandleSpy(getReq, getRes);

    assert(getRes.render.called, 'The payment get route may have not been created.');
    assert(getRes.render.calledWithExactly('payment', sinon.match.object), '`res.render` is not being called with the correct arguments.');

    assert(typeof postHandleSpy === 'function', 'The payment post route may not exist.');
    let accounts;
    try {
      accounts = appModule.__get__('accounts');
    } catch (err) {
      assert(accounts !== undefined, 'Has the `accounts` variable been created in `app.js`?');
    }
    const postRequest = { body: { amount: 325 } };
    const postReq = mockReq(postRequest);
    const postRes = mockRes();

    const { available } = accounts.credit;
    const { balance } = accounts.credit;
    postHandleSpy(postReq, postRes);
    const newAvailable = accounts.credit.available;
    const newBalance = accounts.credit.balance;

    if (fs.existsSync(path.join(process.cwd(), 'src/data.js'))) {
      assert(/writeJSON/.test(postHandleOriginal.toString()), 'The transfer post function does not include a call to `writeJSON`.');
    } else {
      assert(/accountsJSON/.test(postHandleOriginal.toString()), 'The payment post function does not include an `accountsJSON` const.');
      assert(/JSON.stringify/.test(postHandleOriginal.toString()), 'The payment post function does not include a call to `JSON.stringify`.');
      assert(postHandleOriginal.toString().match(/parseInt/).length >= 1, 'Make sure to use `parseInt`.');
    }

    assert(postRes.render.called, 'The payment post route may have not been created.');
    assert(
      postRes.render.calledWithExactly('payment', sinon.match.object),
      '`res.render` is not being called with the correct arguments.'
    );
    assert(
      balance - postRequest.body.amount === newBalance,
      'Your calculation for the credit balance seems to be incorrect.'
    );
    assert(
      available + postRequest.body.amount === newAvailable,
      'Your calculation for the available balance seems to be incorrect.'
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
      'It is best if you encode the string as utf8.'
    );
  });

  after(() => {
    getHandleSpy.restore();
    postHandleSpy.restore();
    writeFileSyncStub.restore();
  });
});

describe('Transfer post route writeJSON', () => {
  it('should include writeJSON @app-post-transfer-route-convert-json', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    assert(typeof stack !== 'undefined', 'The transfer post route may not exist yet.');
    if (fs.existsSync(path.join(process.cwd(), 'src/data.js'))) {
      assert(/writeJSON/.test(stack.handle.toString()), 'The transfer post function does not include a call to `writeJSON`.');
    } else {
      assert(/accountsJSON/.test(stack.handle.toString()), 'The transfer post function does not include an `accountsJSON` const.');
      assert(/JSON.stringify/.test(stack.handle.toString()), 'The transfer post function does not include a call to `JSON.stringify`.');
    }
  });
});

describe('Transfer post route from balance', () => {
  let stack;
  let handleSpy;
  let writeFileSyncStub;

  before(() => {
    stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => { }
      };
    } else {
      handleSpy = sinon.spy(stack, 'handle');
    }
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  it('should calculate `from` balance @app-post-transfer-route-from-balance', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(typeof handleSpy === 'function', 'The transfer post route may not exist.');
    const request = { body: { from: 'savings', to: 'checking', amount: 100 } };

    let accounts;

    try {
      accounts = appModule.__get__('accounts');
    } catch (err) {
      assert(accounts !== undefined, 'Has the `accounts` variable been created in `app.js`?');
    }

    const req = mockReq(request);
    const res = mockRes();

    const currentBalance = accounts[request.body.from].balance;
    handleSpy(req, res);
    const newBalance = accounts[request.body.from].balance;

    assert(currentBalance - request.body.amount === newBalance, 'Your calculation for the new `from` account balance seems to be incorrect.');
  });

  after(() => {
    handleSpy.restore();
    writeFileSyncStub.restore();
  });
});

describe('Transfer post route redirect', () => {
  let stack;
  let handleSpy;
  let writeFileSyncStub;

  before(() => {
    stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => { }
      };
    } else {
      handleSpy = sinon.spy(stack, 'handle');
    }
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  it('should contain the transfer route @app-post-transfer-route-redirect', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const request = {
      body: {
        from: 'savings',
        to: 'checking',
        amount: 100
      }
    };
    const req = mockReq(request);
    const res = mockRes();
    assert(typeof handleSpy === 'function', 'The transfer post route may not exist.');
    handleSpy(req, res);
    assert(res.render.calledWithExactly('transfer', { message: 'Transfer Completed' }), '`res.render` is not being called with the correct arguments.');
  });

  after(() => {
    handleSpy.restore();
    writeFileSyncStub.restore();
  });
});

describe('Transfer post route to balance', () => {
  let stack;
  let handleSpy;
  let handleOriginal;
  let writeFileSyncStub;

  before(() => {
    stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => { }
      };
    } else {
      handleOriginal = stack.handle;
      handleSpy = sinon.spy(stack, 'handle');
    }
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  it('should calculate `to` balance @app-post-transfer-route-to-balance', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(typeof handleSpy === 'function', 'The transfer post route may not exist.');
    const request = { body: { from: 'savings', to: 'checking', amount: 100 } };

    let accounts;
    try {
      accounts = appModule.__get__('accounts');
    } catch (err) {
      assert(accounts !== undefined, 'Has the `accounts` variable been created in `app.js`?');
    }

    const req = mockReq(request);
    const res = mockRes();

    assert(handleOriginal.toString().match(/parseInt/).length >= 1, 'Make sure to use `parseInt`.');

    const currentBalance = accounts[request.body.to].balance;
    handleSpy(req, res);
    const newBalance = accounts[request.body.to].balance;

    assert(
      currentBalance + request.body.amount === newBalance,
      'Your calculation for the new `to` account balance seems to be incorrect.'
    );
  });

  after(() => {
    handleSpy.restore();
    writeFileSyncStub.restore();
  });
});

describe('Transfer post route write JSON', () => {
  let stack;
  let handleSpy;
  let writeFileSyncStub;

  before(() => {
    stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => {}
      };
    } else {
      handleSpy = sinon.spy(stack, 'handle');
    }
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
  });

  it('should contain the index route @app-post-transfer-route-write-json', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const request = {
      body: {
        from: 'savings',
        to: 'checking',
        amount: 100
      }
    };
    const req = mockReq(request);
    const res = mockRes();
    assert(typeof handleSpy === 'function', 'The transfer post route may not exist.');
    handleSpy(req, res);
    assert(writeFileSyncStub.called, '`writeFileSync` was not called.');
    assert(
      writeFileSyncStub.firstCall.args[0].includes('src/json/accounts.json'),
      'The path being passed to `writeFileSync` is incorrect.'
    );
    assert(
      typeof writeFileSyncStub.firstCall.args[1] === 'string',
      'The content being passed to `writeFileSync` is not a string.'
    );
    assert(typeof writeFileSyncStub.firstCall.args[2] !== 'undefined', 'It is best if you encode the string as utf8.');
    assert(
      writeFileSyncStub.firstCall.args[2].replace('-', '').toLowerCase() === 'utf8',
      'It is best if you encode the string as utf8.'
    );
  });

  after(() => {
    handleSpy.restore();
    writeFileSyncStub.restore();
  });
});

describe('Transfer post route', () => {
  let stub;
  let stack;
  before(() => {
    stack = routeStack('/transfer', 'post') || routeStack('/services/transfer', 'post');
    if (typeof stack === 'undefined') {
      stub = { restore: () => {} };
    } else {
      stub = sinon.stub(stack, 'handle');
    }
  });

  it('should contain the post transfer route @app-post-transfer-route', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const request = { body: { from: 'savings', to: 'checking', amount: 100 } };
    const req = mockReq(request);
    const res = mockRes();
    assert(typeof stub === 'function', 'The transfer post route may not exist.');
    stub(req, res);
    assert(stub.called, 'The transfer post route may have not been created yet.');
  });

  after(() => {
    stub.restore();
  });
});
describe('`urlencoded` added', () => {
  it('should add `urlencoded` @app-urlencoded-form-data', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(typeof app._router !== 'undefined', 'No routes have been created.');
    assert(app._router.stack.some(layer => layer.name === 'urlencodedParser'), '`urlencoded` is not being used.');
  });
});

describe('Update `transfer` view', () => {
  it('should update the `transfer` view @transfer-ejs-update-view', () => {
    let file;
    let $;
    try {
      file = fs.readFileSync(path.join(process.cwd(), 'src/views/transfer.ejs'), 'utf8');
      ejs.compile(file);
      $ = cheerio.load(file);
      assert(
        $('#transferForm')
          .attr('method')
          .toLowerCase() === 'post',
        'The form is missing a `method` attribute.'
      );
    } catch (err) {
      assert(err.message.indexOf('compiling ejs') < -1, `Error compiling transfer.ejs`);
    }
    assert(
      $('#transferForm').attr('action') === '/services/transfer' || $('#transferForm').attr('action') === '/transfer',
      'The form is missing an `action` attribute.'
    );
    assert(
      $('select')
        .first()
        .attr('id') === 'from',
      'The first `select` is missing an `id` attribute or it has the wrong value.'
    );
    assert(
      $('select')
        .first()
        .attr('name') === 'from',
      'The first `select` is missing a `name` attribute or it has the wrong value.'
    );
    assert(
      $('select')
        .last()
        .attr('id') === 'to',
      'The second `select` is missing an `id` attribute or it has the wrong value.'
    );
    assert(
      $('select')
        .last()
        .attr('name') === 'to',
      'The second `select` is missing a `name` attribute or it has the wrong value.'
    );
  });
});
