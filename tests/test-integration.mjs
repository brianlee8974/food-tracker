#!/usr/bin/env node

/**
 * Pantry Food Tracker — Milestone 2 Integration Tests
 *
 * Validates: auth, CRUD, data isolation, validation
 *
 * Automatically resets the database, starts the dev server, runs all tests,
 * and stops the server. Run with: npm test
 */

import { execSync, spawn } from 'child_process';

const BASE_URL = 'http://localhost:3000';
const results = [];
let serverProcess = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Valid item data used across test suites
const VALID_ITEM = {
  name: 'Chicken Breast',
  category: 'Meat & Seafood',
  storage: 'Fridge',
  quantity: 2,
  unit: 'lbs',
  expiry: '2026-08-01',
  notes: 'From Costco',
};

// ─── Cookie Jar ─────────────────────────────────────────────────

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  update(response) {
    const headers = response.headers.getSetCookie?.() || [];
    for (const header of headers) {
      const [pair] = header.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) {
        this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    }
  }

  header() {
    if (this.cookies.size === 0) return {};
    return { Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ') };
  }
}

// ─── Test Helpers ───────────────────────────────────────────────

function assert(name, condition, detail = '') {
  if (condition) {
    results.push({ name, pass: true });
    console.log(`  \u2713 ${name}`);
  } else {
    results.push({ name, pass: false, detail });
    console.log(`  \u2717 ${name}${detail ? ` \u2014 ${detail}` : ''}`);
  }
}

async function api(path, opts = {}, jar = null) {
  const headers = { ...opts.headers };
  if (jar) Object.assign(headers, jar.header());
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
    redirect: 'manual',
  });
  if (jar) jar.update(res);
  return res;
}

async function jsonApi(path, opts = {}, jar = null) {
  const res = await api(path, opts, jar);
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body, res };
}

// ─── Auth Helpers ───────────────────────────────────────────────

async function register(email, password, name = null) {
  return jsonApi('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
}

async function login(email, password) {
  const jar = new CookieJar();

  // 1. Get CSRF token
  const csrfRes = await api('/api/auth/csrf', {}, jar);
  const { csrfToken } = await csrfRes.json();

  // 2. Submit credentials
  await api(
    '/api/auth/callback/credentials',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken, email, password }),
    },
    jar
  );

  // 3. Verify session
  const { body: session } = await jsonApi('/api/auth/session', {}, jar);
  return { jar, authenticated: !!session?.user?.email, session };
}

/** Register + login, return the cookie jar. */
async function createAuthenticatedUser(email, password, name = null) {
  await register(email, password, name);
  const { jar } = await login(email, password);
  return jar;
}

// ─── Server Management ─────────────────────────────────────────

function resetDatabase() {
  console.log('\n\uD83D\uDDD1  Resetting database...');
  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('   Database reset complete.\n');
}

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('\uD83D\uDE80 Starting dev server...');
    serverProcess = spawn('npx', ['next', 'dev'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'pipe',
    });

    let resolved = false;
    const onData = (data) => {
      const text = data.toString();
      if (!resolved && text.includes('Ready in')) {
        resolved = true;
        console.log('   Server ready.\n');
        resolve();
      }
    };

    serverProcess.stdout.on('data', onData);
    serverProcess.stderr.on('data', onData);
    serverProcess.on('error', (err) => {
      if (!resolved) reject(err);
    });
    setTimeout(() => {
      if (!resolved) reject(new Error('Server start timeout (30s)'));
    }, 30000);
  });
}

function stopServer() {
  if (!serverProcess) return;
  console.log('\n\uD83D\uDED1 Stopping dev server...');
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
    } catch {
      /* ignore */
    }
  } else {
    serverProcess.kill('SIGTERM');
  }
  serverProcess = null;
}

// ─── Test Suite 1: Auth ─────────────────────────────────────────

async function testAuth() {
  console.log('\u2500\u2500 Auth \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

  // Register successfully
  const reg = await register('auth@test.com', 'password123', 'Auth User');
  assert('Register new user → 201', reg.status === 201, `got ${reg.status}`);
  assert('Register returns user object', !!reg.body?.user?.id);

  // Duplicate email
  const dup = await register('auth@test.com', 'password123');
  assert('Register duplicate email → 400', dup.status === 400, `got ${dup.status}`);

  // Short password
  const shortPw = await register('short@test.com', '12345');
  assert('Register short password → 400', shortPw.status === 400, `got ${shortPw.status}`);

  // Missing fields
  const noFields = await register('', '');
  assert('Register missing fields → 400', noFields.status === 400, `got ${noFields.status}`);

  // Login with valid credentials
  const validLogin = await login('auth@test.com', 'password123');
  assert('Login valid credentials → authenticated', validLogin.authenticated);
  assert('Session contains email', validLogin.session?.user?.email === 'auth@test.com');

  // Login with wrong password
  const badPw = await login('auth@test.com', 'wrongpassword');
  assert('Login wrong password → not authenticated', !badPw.authenticated);

  // Login with non-existent email
  const noUser = await login('nobody@test.com', 'password123');
  assert('Login non-existent user → not authenticated', !noUser.authenticated);

  console.log('');
}

// ─── Test Suite 2: Unauthenticated Access ───────────────────────

async function testUnauthenticatedAccess() {
  console.log('\u2500\u2500 Unauthenticated Access \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

  const get = await jsonApi('/api/items');
  assert('GET /api/items (no auth) → 401', get.status === 401, `got ${get.status}`);

  const post = await jsonApi('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(VALID_ITEM),
  });
  assert('POST /api/items (no auth) → 401', post.status === 401, `got ${post.status}`);

  const put = await jsonApi('/api/items/fake-id', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacked' }),
  });
  assert('PUT /api/items/[id] (no auth) → 401', put.status === 401, `got ${put.status}`);

  const del = await jsonApi('/api/items/fake-id', { method: 'DELETE' });
  assert('DELETE /api/items/[id] (no auth) → 401', del.status === 401, `got ${del.status}`);

  console.log('');
}

// ─── Test Suite 3: CRUD ─────────────────────────────────────────

async function testCRUD() {
  console.log('\u2500\u2500 CRUD \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

  const jar = await createAuthenticatedUser('crud@test.com', 'password123');

  // List empty
  const empty = await jsonApi('/api/items', {}, jar);
  assert('GET /api/items (empty) → 200', empty.status === 200, `got ${empty.status}`);
  assert('Empty list returns []', Array.isArray(empty.body?.items) && empty.body.items.length === 0);

  // Create
  const create = await jsonApi(
    '/api/items',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_ITEM),
    },
    jar
  );
  assert('POST /api/items → 201', create.status === 201, `got ${create.status}`);
  assert('Created item has server ID', !!create.body?.item?.id);
  assert('Created item has correct name', create.body?.item?.name === 'Chicken Breast');
  assert('Created item has createdAt', !!create.body?.item?.createdAt);

  const itemId = create.body?.item?.id;

  // List after create
  const list = await jsonApi('/api/items', {}, jar);
  assert('GET /api/items has 1 item', list.body?.items?.length === 1);

  // Get single
  const single = await jsonApi(`/api/items/${itemId}`, {}, jar);
  assert('GET /api/items/[id] → 200', single.status === 200, `got ${single.status}`);
  assert('Single item matches', single.body?.item?.name === 'Chicken Breast');

  // Update (partial)
  const update = await jsonApi(
    `/api/items/${itemId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Salmon Fillet', quantity: 1.5 }),
    },
    jar
  );
  assert('PUT /api/items/[id] → 200', update.status === 200, `got ${update.status}`);
  assert('Name updated', update.body?.item?.name === 'Salmon Fillet');
  assert('Quantity updated', update.body?.item?.quantity === 1.5);
  assert('Category unchanged', update.body?.item?.category === 'Meat & Seafood');

  // Delete
  const del = await jsonApi(`/api/items/${itemId}`, { method: 'DELETE' }, jar);
  assert('DELETE /api/items/[id] → 200', del.status === 200, `got ${del.status}`);

  // Get after delete
  const gone = await jsonApi(`/api/items/${itemId}`, {}, jar);
  assert('GET after delete → 404', gone.status === 404, `got ${gone.status}`);

  // List after delete
  const emptyAgain = await jsonApi('/api/items', {}, jar);
  assert('List after delete is empty', emptyAgain.body?.items?.length === 0);

  console.log('');
}

// ─── Test Suite 4: Data Isolation ───────────────────────────────

async function testDataIsolation() {
  console.log('\u2500\u2500 Data Isolation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

  const aliceJar = await createAuthenticatedUser('alice@test.com', 'password123', 'Alice');
  const bobJar = await createAuthenticatedUser('bob@test.com', 'password123', 'Bob');

  // Alice creates an item
  const aliceItem = await jsonApi(
    '/api/items',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...VALID_ITEM, name: 'Alice Milk' }),
    },
    aliceJar
  );
  const aliceItemId = aliceItem.body?.item?.id;

  // Bob creates an item
  const bobItem = await jsonApi(
    '/api/items',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...VALID_ITEM, name: 'Bob Eggs' }),
    },
    bobJar
  );
  const bobItemId = bobItem.body?.item?.id;

  // Alice sees only her item
  const aliceList = await jsonApi('/api/items', {}, aliceJar);
  assert(
    'Alice sees only her items',
    aliceList.body?.items?.length === 1 && aliceList.body.items[0].name === 'Alice Milk'
  );

  // Bob sees only his item
  const bobList = await jsonApi('/api/items', {}, bobJar);
  assert(
    'Bob sees only his items',
    bobList.body?.items?.length === 1 && bobList.body.items[0].name === 'Bob Eggs'
  );

  // Alice cannot GET Bob's item
  const crossGet = await jsonApi(`/api/items/${bobItemId}`, {}, aliceJar);
  assert("Alice GET Bob's item → 404", crossGet.status === 404, `got ${crossGet.status}`);

  // Alice cannot PUT Bob's item
  const crossPut = await jsonApi(
    `/api/items/${bobItemId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'HACKED' }),
    },
    aliceJar
  );
  assert("Alice PUT Bob's item → 404", crossPut.status === 404, `got ${crossPut.status}`);

  // Alice cannot DELETE Bob's item
  const crossDel = await jsonApi(`/api/items/${bobItemId}`, { method: 'DELETE' }, aliceJar);
  assert("Alice DELETE Bob's item → 404", crossDel.status === 404, `got ${crossDel.status}`);

  // Bob's item is still intact
  const bobCheck = await jsonApi(`/api/items/${bobItemId}`, {}, bobJar);
  assert("Bob's item still exists after Alice's attempts", bobCheck.status === 200 && bobCheck.body?.item?.name === 'Bob Eggs');

  console.log('');
}

// ─── Test Suite 5: Validation ───────────────────────────────────

async function testValidation() {
  console.log('\u2500\u2500 Validation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

  const jar = await createAuthenticatedUser('validation@test.com', 'password123');

  const post = (data) =>
    jsonApi(
      '/api/items',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      jar
    );

  // Strict validation on create
  const noName = await post({ ...VALID_ITEM, name: '' });
  assert('POST empty name → 400', noName.status === 400, `got ${noName.status}`);

  const badCat = await post({ ...VALID_ITEM, category: 'InvalidCategory' });
  assert('POST invalid category → 400', badCat.status === 400, `got ${badCat.status}`);

  const badStorage = await post({ ...VALID_ITEM, storage: 'Garage' });
  assert('POST invalid storage → 400', badStorage.status === 400, `got ${badStorage.status}`);

  const negQty = await post({ ...VALID_ITEM, quantity: -5 });
  assert('POST negative quantity → 400', negQty.status === 400, `got ${negQty.status}`);

  const badUnit = await post({ ...VALID_ITEM, unit: 'bushels' });
  assert('POST invalid unit → 400', badUnit.status === 400, `got ${badUnit.status}`);

  const badExpiry = await post({ ...VALID_ITEM, expiry: 'not-a-date' });
  assert('POST malformed expiry → 400', badExpiry.status === 400, `got ${badExpiry.status}`);

  // Create a real item for update validation tests
  const created = await post(VALID_ITEM);
  const itemId = created.body?.item?.id;

  const put = (data) =>
    jsonApi(
      `/api/items/${itemId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      jar
    );

  // Lenient validation on update
  const putEmptyName = await put({ name: '' });
  assert('PUT empty name → 400', putEmptyName.status === 400, `got ${putEmptyName.status}`);

  const putNegQty = await put({ quantity: -1 });
  assert('PUT negative quantity → 400', putNegQty.status === 400, `got ${putNegQty.status}`);

  // Lenient: category not checked against constants on update
  const putBadCat = await put({ category: 'CustomCategory' });
  assert('PUT non-standard category → 200 (lenient)', putBadCat.status === 200, `got ${putBadCat.status}`);

  console.log('');
}

// ─── Main ───────────────────────────────────────────────────────

function printSummary() {
  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.filter((r) => !r.pass).length;

  console.log('\u2500'.repeat(50));
  console.log(`Results: ${passCount} passed, ${failCount} failed, ${results.length} total`);

  if (failCount > 0) {
    console.log('\nFailed tests:');
    results
      .filter((r) => !r.pass)
      .forEach((r) => {
        console.log(`  \u2717 ${r.name}${r.detail ? ` \u2014 ${r.detail}` : ''}`);
      });
    process.exitCode = 1;
  } else {
    console.log('\n\u2705 All tests passed!');
  }
}

async function main() {
  console.log('\n\uD83E\uDDEA Pantry Food Tracker \u2014 Milestone 2 Integration Tests\n');

  try {
    resetDatabase();
    await startServer();
    await sleep(1500); // warm-up for first compilation

    await testAuth();
    await testUnauthenticatedAccess();
    await testCRUD();
    await testDataIsolation();
    await testValidation();
  } catch (err) {
    console.error('\n\u274C Fatal error:', err.message);
    process.exitCode = 1;
  } finally {
    stopServer();
    printSummary();
  }
}

main();
