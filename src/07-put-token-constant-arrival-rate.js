import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',

      // Our test should last 5 minutes in total
      duration: '5m',

      // It should start 300 iterations per `timeUnit`. Note that iterations starting points
      // will be evenly spread across the `timeUnit` period.
      rate: 300,

      // It should start `rate` iterations per second
      timeUnit: '1s',

      // It should preallocate 300 VUs before starting the test
      preAllocatedVUs: 300,

      // It is allowed to spin up to 300 maximum VUs to sustain the defined
      // constant arrival rate.
      maxVUs: 600,
    },
  },
};

const apiVersion = 'v1';
const throttling = new Counter('throttling');

const random = (length = 8) => {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    // Pick characters randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};

export default function () {

    var apiKey = `${__ENV.API_KEY}`
    var hostName = `${__ENV.HOST_NAME}`

  var url = `https://${hostName}/tokenizer/${apiVersion}/tokens`;

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
  };

  var payload = JSON.stringify(
    {
        'pii': random(4)
    }
);

  var r = http.put(url, payload, params);

  console.log(`Status ${r.status}`);

  check(r, {
    'status is 200': (r) => r.status === 200,
  });

  if (r.status === 429) {
    throttling.add(1);
  }

}