const R = require('ramda');
const proxyquire = require('proxyquire');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

describe('Default Route', () => {
  let stack;
  let handleSpy;

  before(() => {
    stack = routeStack('/', 'get');
    if (typeof stack === 'undefined') {
      handleSpy = {
        restore: () => { }
      };
    } else {
      handleSpy = sinon.spy(stack, 'handle');
    }
  });

  it('should contain the index route @app-get-index-route', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    const req = mockReq();
    const res = mockRes();

    assert(typeof handleSpy === 'function', 'No routes have been created.');
    handleSpy(req, res);
    assert(res.render.called, 'The index route may have not been created.');
    assert(res.render.firstCall.args[0] === 'index', 'The index route does not seem to be rendering the `index` view.');
    assert(
      R.has('title')(res.render.firstCall.args[1]),
      'The index route maybe missing an object with a `title: "Index"` key value pair.'
    );
  });

  after(() => {
    handleSpy.restore();
  });
});

describe('Server created with app.listen', () => {
  let listenStub;
  before(() => {
    listenStub = sinon.stub().returns({});
    proxyquire('../src/app', {
      express: sinon.stub().returns({
        get: sinon.spy(),
        post: sinon.spy(),
        set: sinon.spy(),
        use: sinon.spy(),
        listen: listenStub
      })
    });
  });

  it('should contain app.listen @app-listen-console-log', () => {
    assert(listenStub.calledOnce, '`app.listen` has not been called.');
    assert(
      listenStub.calledWithExactly(3000, sinon.match.func),
      '`app.listen` was not called with the correct arguments.'
    );
  });
});

describe('Require `fs` and `path` built-ins', () => {
  it('should contain requires @app-require-built-ins', () => {
    let fs;
    let path;
    try {
      fs = appModule.__get__('fs');
      path = appModule.__get__('path');
    } catch (err) {
      assert(fs !== undefined, 'Has the `fs` built-in module been required in `app.js`?');
      assert(path !== undefined, 'Has the `path` built-in module been required in `app.js`?');
    }
  });
});
describe('Require Express and Create `app` const', () => {
  it('require express and create app const @app-require-express-const-app', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    let express;
    try {
      express = appModule.__get__('express');
    } catch (err) {
      assert(express !== undefined, 'Has the `express` framework been required in `app.js`?');
    }
  });
});

describe('View engine and directory', () => {
  it('should set view engine and directory @app-set-views-directory-engine', () => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    assert(app.settings.views.includes('views'), 'The view directory has not been set to the `views` directory.');
    assert(app.settings['view engine'] === 'ejs', 'The view engine has not been set to `ejs`.');
  });
});

describe('Static Directory', () => {
  it('should set express static directory @app-use-express-static', done => {
    assert(typeof app === 'function', '`app` const has not been created in `app.js`.');
    request(app)
      .get('/css/styles.css')
      .expect(res => {
        assert(/^body {/.test(res.text), 'Looks as if the `public` directory has not been set as the static directory.');
      })
      .end(done);
  });
});

describe('`index.ejs` exists', () => {
  it('`index.ejs` should exist  @index-ejs-create-view-file', () => {
    assert(fs.existsSync(path.join(process.cwd(), 'src/views/index.ejs')), 'The `index.ejs` view file does not exist.');
  });
});

describe('Create `index` view', () => {
  it('should create the index view @index-ejs-create-view', () => {
    let file;
    try {
      file = fs.readFileSync(path.join(process.cwd(), 'src/views/index.ejs'), 'utf8');
      ejs.compile(file);
    } catch (err) {
      assert(err.code !== 'ENOENT', 'The `index.ejs` view file does not exist.');
      const errorMessage = err.message.substring(0, err.message.indexOf('compiling ejs'));
      assert(err.message.indexOf('compiling ejs') < -1, ` ${errorMessage}Error compiling index.ejs`);
    }
    assert(/<%-\s+include\(('|")header(\.ejs)?('|")\)(;)?\s*%>/.test(file), 'Have you included the `header` view?');
    assert(/<div\s+class\s*=\s*("|'|\s*)container(\s*|"|')>/.test(file), 'The `div` with a class of `container` can not be found.');
    assert(/<%=\s*title\s*%>/.test(file), 'The `title` variable seems to be missing.');
    assert(/<a\s+href=('|")?\/profile('|")?>\s*(P|p)rofile\s*<\/a>/.test(file), 'The `profile` link seems to be missing.');
    assert(/<a\s+href=('|")?(\/services)?\/transfer('|")?>\s*(T|t)ransfer\s*<\/a>/.test(file), 'The `transfer` link seems to be missing.');
    assert(/<%-\s+include\(('|")footer(\.ejs)?('|")\)(;)?\s*%>/.test(file), 'Have you included the `footer` view?');
  });
});
