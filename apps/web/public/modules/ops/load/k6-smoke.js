import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '5m', target: 30 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<900'],
  },
};

export default function () {
  http.get('https://api.nexaai.co.uk/api/public/status');
  sleep(1);
}

