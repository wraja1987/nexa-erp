import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '5m', target: 30 },
    { duration: '1m', target: 0  },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // <1% failures
    http_req_duration: ['p(95)<900'], // p95 < 900ms
  },
};

const URL = __ENV.K6_URL || 'https://nexaai.co.uk/'; // default to a guaranteed 200

export default function () {
  const res = http.get(URL, { tags: { name: 'k6-smoke' } });
  if (res.status !== 200) {
    console.error(`k6 status ${res.status} for ${URL}`);
  }
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
