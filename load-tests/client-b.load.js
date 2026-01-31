const autocannon = require('autocannon');

const url = process.env.URL || 'http://localhost:3000/shipments/client-b';

const body = JSON.stringify({
  id: 'A9981-SH',
  route: {
    pol: 'SGSIN',
    pod: 'CNSHA',
  },
  schedule: {
    etd: '2026-03-01',
    eta: '2026-03-18',
  },
  metrics: {
    weight: 9800,
  },
  status_code: 'INTRANSIT',
});

const instance = autocannon(
  {
    url,
    connections: 1,
    duration: 1,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body,
  },
  (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Load test for Client B completed');
      console.log(result);
    }
  },
);

autocannon.track(instance, { renderProgressBar: true });
