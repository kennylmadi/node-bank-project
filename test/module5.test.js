const proxyquire = require('proxyquire');
const R = require('ramda');
const rewire = require('rewire');
const ejs = require('ejs');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

describe('Require accounts routes', () => {
  it('require express and create app const @app-require-account-routes', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let accountRoutes;
    try {
      accountRoutes = appModule.__get__('accountRoutes');
    } catch (err) {
      assert(accountRoutes !== undefined, 'Has the `accountRoutes` const been created `app.js`?');
    }
    assert(typeof accountRoutes === 'function', 'Has the router been exported in `src/routes/accounts.js`?');
  });
});
describe('Require services routes', () => {
  it('require express and create app const @app-require-services-routes', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let servicesRoutes;
    try {
      servicesRoutes = appModule.__get__('servicesRoutes');
    } catch (err) {
      assert(servicesRoutes !== undefined, 'Has the `servicesRoutes` const been created `app.js`?');
    }
    assert(typeof servicesRoutes === 'function', 'Has the router been exported in `src/routes/services.js`?');
  });
});

describe('App uses account routes', () => {
  let useSpy;
  before(() => {
    useSpy = sinon.spy();
    proxyquire('../src/app', {
      express: sinon.stub().returns({
        get: sinon.spy(),
        post: sinon.spy(),
        set: sinon.spy(),
        use: useSpy,
        listen: sinon.stub().returns({})
      })
    });
  });

  it('should contain app.use for account routes @app-use-account-routes', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/accounts.js')), 'The `src/routes/accounts.js` file does not exist.');
    const accountRoutes = require(path.join(process.cwd(), 'src/routes/accounts.js'));
    assert(useSpy.calledWithExactly('/account', accountRoutes), 'Are you using your account routes?');
  });
});

describe('App uses services routes', () => {
  let useSpy;
  before(() => {
    useSpy = sinon.spy();
    proxyquire('../src/app', {
      express: sinon.stub().returns({
        get: sinon.spy(),
        post: sinon.spy(),
        set: sinon.spy(),
        use: useSpy,
        listen: sinon.stub().returns({})
      })
    });
  });

  it('should contain `app.use` for services @app-use-services-routes', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/services.js')), 'The `src/routes/services.js` file does not exist.');
    const servicesRoutes = require(path.join(process.cwd(), 'src/routes/services.js'));
    assert(useSpy.calledWithExactly('/services', servicesRoutes), 'Are you using your services routes?');
  });
});

describe('`src/routes/accounts.js` exists', () => {
  it('`src/routes/accounts.js` should exist  @routes-accounts-js-create-file', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes')), 'The `routes` dir does not exist.');
    assert(
      fs.existsSync(path.join(process.cwd(), 'src/routes/accounts.js')),
      'The `src/routes/accounts.js` file does not exist.'
    );
  });
});

describe('`accounts.js` exports', () => {
  it('`accounts.js` should export router @routes-accounts-js-export-router', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/accounts.js')), 'The `src/routes/accounts.js` file does not exist.');
    let localRouter;

    try {
      localRouter = require('../src/routes/accounts');
    } catch (err) {
      assert(false, 'The `src/routes/accounts.js` file does not exist or can not be required.');
    }

    assert(localRouter !== undefined && typeof localRouter === 'function', '`src/routes/accounts.js` is not exporting the `router` function.');
  });
});

describe('Move account routes', () => {
  it('`accounts.js` should contain routes @routes-accounts-js-move-routes', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/accounts.js')), 'The `src/routes/accounts.js` file does not exist.');
    let express;
    let router;
    try {
      const accountsModule = rewire('../src/routes/accounts');
      express = accountsModule.__get__('express');
      router = accountsModule.__get__('router');
    } catch (err) {
      assert(express !== undefined, 'Has the `express` framework been required in `src/routes/accounts.js`?');
      assert(router !== undefined, 'Has the express `router` been added to `src/routes/accounts.js`?');
    }
    assert(typeof router === 'function', 'Has the `router` const been set to the express router function?');
    assert(router.stack.length === 3, 'Were all three routes moved to `accounts.js` and added to the router?');

    const getRoutes = [];
    router.stack.forEach(routes => {
      if (routes.route.methods.get) {
        getRoutes.push(routes.route.path);
      }
    });

    assert(routeStack('/savings', 'get') === undefined, 'The savings route has not been removed from `app.js`.');
    assert(routeStack('/checking', 'get') === undefined, 'The checking route has not been removed from `app.js`.');
    assert(routeStack('/credit', 'get') === undefined, 'The credit route has not been removed from `app.js`.');

    assert(R.contains('/savings', getRoutes), 'The accounts router does not contain a savings route.');
    assert(R.contains('/checking', getRoutes), 'The accounts router does not contain a checking route.');
    assert(R.contains('/credit', getRoutes), 'The accounts router does not contain a credit route.');
  });
});

describe('Require `data.js` - accounts', () => {
  it('should contain `accounts` const @routes-accounts-js-require-data', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/accounts.js')), 'The `src/routes/accounts.js` file does not exist.');
    let accounts;
    try {
      const accountsModule = rewire('../src/routes/accounts');
      accounts = accountsModule.__get__('accounts');
    } catch (err) {
      assert(accounts !== undefined, 'Has `data.js` been required and the `accounts` const been created in `src/routes/accounts.js`?');
    }
    assert(typeof accounts === 'object', 'Is the `accounts` const an object?');
  });
});

describe('Require Express and Create Router - accounts', () => {
  it('require express and create app const @routes-accounts-js-require-express', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/accounts.js')), 'The `src/routes/accounts.js` file does not exist.');
    let express;
    let router;
    try {
      const accountsModule = rewire('../src/routes/accounts');
      express = accountsModule.__get__('express');
      router = accountsModule.__get__('router');
    } catch (err) {
      assert(express !== undefined, 'Has the `express` framework been required in `src/routes/accounts.js`?');
      assert(router !== undefined, 'Has the express `router` been added to `src/routes/accounts.js`?');
    }
    assert(typeof router === 'function', 'Has the `router` const been set to the express router function?');
  });
});

describe('`src/routes/services.js` exists', () => {
  it('`src/routes/services.js` should exist  @routes-services-js-create-file', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes')), 'The `routes` dir does not exist.');
    assert(
      fs.existsSync(path.join(process.cwd(), 'src/routes/services.js')),
      'The `src/routes/accounts.js` file does not exist.'
    );
  });
});

describe('`services.js` exports', () => {
  it('`services.js` should export router @routes-services-js-export-router', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(
      fs.existsSync(path.join(process.cwd(), 'src/routes/services.js')),
      'The `src/routes/services.js` file does not exist.'
    );
    let localRouter;

    try {
      localRouter = require('../src/routes/services');
    } catch (err) {
      assert(false, 'The `src/routes/services.js` file does not exist or can not be required.');
    }

    assert(
      localRouter !== undefined && typeof localRouter === 'function',
      '`src/routes/services.js` is not exporting the `router` function.'
    );
  });
});

describe('Move services routes', () => {
  it('`services.js` should contain routes @routes-services-js-move-routes', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/services.js')), 'The `src/routes/services.js` file does not exist.');
    let express;
    let router;
    try {
      const servicesModule = rewire('../src/routes/services');
      express = servicesModule.__get__('express');
      router = servicesModule.__get__('router');
    } catch (err) {
      assert(express !== undefined, 'Has the `express` framework been required in `src/routes/services.js`?');
      assert(router !== undefined, 'Has the express `router` been added to `src/routes/services.js`?');
    }
    assert(typeof router === 'function', 'Has the `router` const been set to the express router function?');
    assert(router.stack.length === 4, 'Were all four routes moved to `services.js`?');

    const getRoutes = [];
    router.stack.forEach(routes => {
      if (routes.route.methods.get) {
        getRoutes.push(routes.route.path);
      }
    });

    const postRoutes = [];
    router.stack.forEach(routes => {
      if (routes.route.methods.get) {
        postRoutes.push(routes.route.path);
      }
    });

    assert(routeStack('/transfer', 'get') === undefined, 'The transfer get route has not been removed from `app.js`.');
    assert(routeStack('/transfer', 'post') === undefined, 'The transfer post route has not been removed from `app.js`.');
    assert(routeStack('/payment', 'get') === undefined, 'The payment get route has not been removed from `app.js`.');
    assert(routeStack('/payment', 'post') === undefined, 'The payment post route has not been removed from `app.js`.');

    assert(R.contains('/transfer', getRoutes), 'The services router does not contain a transfer get route.');
    assert(R.contains('/transfer', postRoutes), 'The services router does not contain a transfer post route.');
    assert(R.contains('/payment', getRoutes), 'The services router does not contain a payment get route.');
    assert(R.contains('/payment', postRoutes), 'The services router does not contain a payment post route.');
  });
});

describe('Require `data.js` - services', () => {
  it('should contain `services` const @routes-services-js-require-data', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/services.js')), 'The `src/routes/services.js` file does not exist.');
    let accounts;
    let writeJSON;
    try {
      const servicesModule = rewire('../src/routes/services');
      accounts = servicesModule.__get__('accounts');
      writeJSON = servicesModule.__get__('writeJSON');
    } catch (err) {
      assert(accounts !== undefined, 'Has an `accounts` constant been created when requiring the `data` library in `src/routes/services.js`?');
      assert(writeJSON !== undefined, 'Has the `writeJSON` function been created when requiring the `data` library in `src/routes/services.js`?');
    }
    assert(typeof accounts === 'object', 'Is the `accounts` constant an object?');
    assert(typeof writeJSON === 'function', 'Is `writeJSON` a function?');
  });
});

describe('Require Express and Create Router - services', () => {
  it('require express and create app const @routes-services-js-require-express', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/routes/services.js')), 'The `src/routes/services.js` file does not exist.');

    let express;
    let router;
    try {
      const servicesModule = rewire('../src/routes/services');
      express = servicesModule.__get__('express');
      router = servicesModule.__get__('router');
    } catch (err) {
      assert(express !== undefined, 'Has the `express` framework been required in `src/routes/services.js`?');
      assert(router !== undefined, 'Has the express `router` been added to `src/routes/services.js`?');
    }
    assert(typeof router === 'function', 'Has the `router` const been set to the express router function?');
  });
});

describe('Update views', () => {
  it('should update all views @views-update-for-routes', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/views/index.ejs')), 'The `src/views/index.ejs` file does not exist.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/views/summary.ejs')), 'The `src/views/summary.ejs` file does not exist.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/views/transfer.ejs')), 'The `src/views/transfer.ejs` file does not exist.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/views/payment.ejs')), 'The `src/views/payment.ejs` file does not exist.');
    assert(fs.existsSync(path.join(process.cwd(), 'src/views/account.ejs')), 'The `src/views/account.ejs` file does not exist.');

    let indexFile;
    let summaryFile;
    let transferFile;
    let paymentFile;
    let accountFile;
    let $index;
    let $summary;
    let $transfer;
    let $payment;
    let $account;
    try {
      indexFile = fs.readFileSync(path.join(process.cwd(), 'src/views/index.ejs'), 'utf8');
      summaryFile = fs.readFileSync(path.join(process.cwd(), 'src/views/summary.ejs'), 'utf8');
      transferFile = fs.readFileSync(path.join(process.cwd(), 'src/views/transfer.ejs'), 'utf8');
      paymentFile = fs.readFileSync(path.join(process.cwd(), 'src/views/payment.ejs'), 'utf8');
      accountFile = fs.readFileSync(path.join(process.cwd(), 'src/views/account.ejs'), 'utf8');

      ejs.compile(indexFile);
      ejs.compile(summaryFile);
      ejs.compile(transferFile);
      ejs.compile(paymentFile);
      ejs.compile(accountFile);

      $index = cheerio.load(indexFile);
      $summary = cheerio.load(summaryFile);
      $transfer = cheerio.load(transferFile);
      $payment = cheerio.load(paymentFile);
      $account = cheerio.load(accountFile);
    } catch (err) {
      const errorMessage = err.message.substring(0, err.message.indexOf('compiling ejs') - 1);
      assert(err.message.indexOf('compiling ejs') < -1, `${errorMessage} compiling index.ejs`);
    }

    assert(typeof $index('a')['1'] !== 'undefined', 'The transfer link in `index.ejs` is missing.');
    assert($index('a')['1'].attribs.href === '/services/transfer', 'The transfer link in `index.ejs` has not been updated.');
    assert($summary('a').attr('href') === '/account/<%= account.unique_name %>', 'The account link in `summary.ejs` link has not been updated.');
    assert($transfer('#transferForm').attr('action') === '/services/transfer', 'The transfer form action attribute has not been updated.');
    assert($payment('#paymentForm').attr('action') === '/services/payment', 'The payment form action attribute has not been updated.');
    assert(typeof $index('a')['0'] !== 'undefined', 'The payment link has not been updated.');
    assert($account('a')['0'].attribs.href === '/services/payment', 'The payment link in `account.ejs` has not been updated.');
  });
});
