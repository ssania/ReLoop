const path = require('path');

const backendRoot = path.resolve(__dirname, '..', '..');

function modulePath(relativePath) {
  return path.join(backendRoot, relativePath);
}

function mockModule(relativePath, exports) {
  const resolved = require.resolve(modulePath(relativePath));
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports,
  };
}

function mockPackage(packageName, exports) {
  const resolved = require.resolve(packageName, { paths: [backendRoot] });
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports,
  };
}

function loadFresh(relativePath) {
  const resolved = require.resolve(modulePath(relativePath));
  delete require.cache[resolved];
  return require(resolved);
}

function clearModules(relativePaths) {
  for (const relativePath of relativePaths) {
    const resolved = require.resolve(modulePath(relativePath));
    delete require.cache[resolved];
  }
}

function mockResponse() {
  const res = {
    statusCode: 200,
    body: undefined,
    redirectedTo: undefined,
    sent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.sent = true;
      return this;
    },
    send(payload) {
      this.body = payload;
      this.sent = true;
      return this;
    },
    redirect(url) {
      this.redirectedTo = url;
      this.sent = true;
      return this;
    },
  };
  return res;
}

function makePopulateChain(result) {
  const chain = {
    populate() {
      return chain;
    },
    then(resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return chain;
}

function makeQueryChain(result) {
  const chain = {
    populate() {
      return chain;
    },
    sort() {
      return chain;
    },
    select() {
      return chain;
    },
    lean() {
      return Promise.resolve(result);
    },
  };
  return chain;
}

module.exports = {
  clearModules,
  loadFresh,
  makePopulateChain,
  makeQueryChain,
  mockModule,
  mockPackage,
  mockResponse,
};
