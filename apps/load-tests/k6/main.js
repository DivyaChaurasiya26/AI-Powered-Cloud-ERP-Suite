/**
 * Day 21 – k6 Load Test
 * 2,000 concurrent virtual users, 10-minute steady state
 *
 * Usage:
 *   k6 run load-tests/k6/main.js
 *   k6 run --env BASE_URL=http://your-host:5000 load-tests/k6/main.js
 *
 * Note: The general rate limiter (100 req/60s per IP) will trigger
 * during this test from a single machine. For production load testing,
 * use k6 Cloud or distribute VUs across multiple source IPs, or
 * temporarily increase the rate limiter points for the test environment.
 *
 * Requires test data:
 *   - A user account: TEST_EMAIL / TEST_PASSWORD env vars
 *   - At least one tenant with seeded invoices, employees, projects, inventory
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ── Custom metrics ────────────────────────────────────────────────────────────

const kpiDuration       = new Trend('kpi_duration',       true);
const chartDuration     = new Trend('chart_duration',      true);
const employeesDuration = new Trend('employees_duration',  true);
const projectsDuration  = new Trend('projects_duration',   true);
const rate429           = new Counter('rate_limit_hits');

// ── Load profile ──────────────────────────────────────────────────────────────

export const options = {
  stages: [
    { duration: '1m',  target: 200  },  // ramp up to 200 VU
    { duration: '3m',  target: 2000 },  // ramp up to 2,000 VU
    { duration: '10m', target: 2000 },  // steady state — 10 minutes
    { duration: '2m',  target: 0    },  // ramp down
  ],
  thresholds: {
    // Core SLA
    'http_req_duration{scenario:default}': ['p(95)<500', 'p(99)<2000'],
    'http_req_failed':                     ['rate<0.01'],
    // Endpoint-specific
    'kpi_duration':       ['p(95)<1000'],
    'chart_duration':     ['p(95)<800'],
    'employees_duration': ['p(95)<300'],
    'projects_duration':  ['p(95)<400'],
  },
};

// ── Setup: log in once and share the token ─────────────────────────────────

export function setup() {
  const base     = __ENV.BASE_URL       || 'http://localhost:5000';
  const email    = __ENV.TEST_EMAIL     || 'test@example.com';
  const password = __ENV.TEST_PASSWORD  || 'testpassword123';

  const res = http.post(
    `${base}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = check(res, {
    'setup: login 200': (r) => r.status === 200,
    'setup: has token': (r) => !!r.json('token'),
  });

  if (!ok) {
    console.error(`Login failed: ${res.status} ${res.body}`);
  }

  return {
    base,
    token: res.json('token') || '',
  };
}

// ── Helper ────────────────────────────────────────────────────────────────────

function authHeaders(token) {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
  };
}

function checkOk(res, label) {
  if (res.status === 429) {
    rate429.add(1);
    return;
  }
  check(res, { [`${label} 2xx`]: (r) => r.status >= 200 && r.status < 300 });
}

// ── Persona flows ─────────────────────────────────────────────────────────────

// Dashboard Viewer — 30% of VUs
function dashboardFlow(base, token) {
  group('Dashboard Viewer', () => {
    let res = http.get(`${base}/api/dashboard/kpis`, authHeaders(token));
    kpiDuration.add(res.timings.duration);
    checkOk(res, 'GET /kpis');
    sleep(1);

    res = http.get(
      `${base}/api/dashboard/chart?chartType=bar&dataSource=revenue`,
      authHeaders(token)
    );
    chartDuration.add(res.timings.duration);
    checkOk(res, 'GET /chart bar revenue');
    sleep(0.5);

    res = http.get(
      `${base}/api/dashboard/chart?chartType=pie&dataSource=expenses`,
      authHeaders(token)
    );
    chartDuration.add(res.timings.duration);
    checkOk(res, 'GET /chart pie expenses');
    sleep(0.5);

    res = http.get(
      `${base}/api/dashboard/analytics/revenue`,
      authHeaders(token)
    );
    checkOk(res, 'GET /analytics/revenue');
    sleep(1);
  });
}

// Finance User — 20% of VUs
function financeFlow(base, token) {
  group('Finance User', () => {
    let res = http.get(`${base}/api/vendors`, authHeaders(token));
    checkOk(res, 'GET /vendors');
    sleep(1);

    res = http.get(`${base}/api/vendor-invoices`, authHeaders(token));
    checkOk(res, 'GET /vendor-invoices');
    sleep(1);
  });
}

// HR Manager — 20% of VUs
function hrFlow(base, token) {
  group('HR Manager', () => {
    let res = http.get(`${base}/api/employees`, authHeaders(token));
    employeesDuration.add(res.timings.duration);
    checkOk(res, 'GET /employees');
    sleep(1);

    res = http.get(`${base}/api/leaves`, authHeaders(token));
    checkOk(res, 'GET /leaves');
    sleep(0.5);

    res = http.get(`${base}/api/attendance`, authHeaders(token));
    checkOk(res, 'GET /attendance');
    sleep(1);
  });
}

// Project Manager — 15% of VUs
function projectFlow(base, token) {
  group('Project Manager', () => {
    let res = http.get(`${base}/api/projects`, authHeaders(token));
    projectsDuration.add(res.timings.duration);
    checkOk(res, 'GET /projects');
    sleep(0.5);

    res = http.get(`${base}/api/tasks`, authHeaders(token));
    checkOk(res, 'GET /tasks');
    sleep(0.5);

    res = http.get(`${base}/api/milestones`, authHeaders(token));
    checkOk(res, 'GET /milestones');
    sleep(0.5);

    res = http.get(`${base}/api/projects/utilisation`, authHeaders(token));
    checkOk(res, 'GET /projects/utilisation');
    sleep(1);
  });
}

// Inventory Manager — 10% of VUs
function inventoryFlow(base, token) {
  group('Inventory Manager', () => {
    let res = http.get(`${base}/api/inventory`, authHeaders(token));
    checkOk(res, 'GET /inventory');
    sleep(1);

    res = http.get(`${base}/api/purchase-orders`, authHeaders(token));
    checkOk(res, 'GET /purchase-orders');
    sleep(1);
  });
}

// Notification Poller — 5% of VUs
function notificationFlow(base, token) {
  group('Notification Poller', () => {
    let res = http.get(`${base}/api/notifications`, authHeaders(token));
    checkOk(res, 'GET /notifications');
    sleep(2);

    res = http.get(`${base}/api/notifications/preferences`, authHeaders(token));
    checkOk(res, 'GET /notifications/preferences');
    sleep(2);
  });
}

// ── Default function — routes VUs to personas by VU index ─────────────────────

export default function (data) {
  const { base, token } = data;

  const bucket = __VU % 20;

  if      (bucket < 6)  dashboardFlow(base, token);    // 30%
  else if (bucket < 10) financeFlow(base, token);       // 20%
  else if (bucket < 14) hrFlow(base, token);            // 20%
  else if (bucket < 17) projectFlow(base, token);       // 15%
  else if (bucket < 19) inventoryFlow(base, token);     // 10%
  else                  notificationFlow(base, token);   //  5%
}