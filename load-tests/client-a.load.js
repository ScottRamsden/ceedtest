const autocannon = require('autocannon');

const url = process.env.URL || 'http://localhost:3000/shipments/client-a';

const body = JSON.stringify({
  shipmentReference: 'CBX-784512',
  originPortCode: 'NLRTM',
  destinationPortCode: 'USNYC',
  departureEstimate: '2026-02-10T18:00:00Z',
  arrivalEstimate: '2026-02-22T09:30:00Z',
  cargoWeightKg: 12450,
  shipmentState: 'IN_TRANSIT',
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
      console.log('Load test for Client A completed');
      console.log(result);
    }
  },
);

autocannon.track(instance, { renderProgressBar: true });
