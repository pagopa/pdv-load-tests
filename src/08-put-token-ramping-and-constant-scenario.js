import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    ramping: {
      executor: 'ramping-arrival-rate',

      // Start iterations per `timeUnit`
      startRate: 50,

      // Start `startRate` iterations per seconds
      timeUnit: '1s',

      // Pre-allocate necessary VUs.
      preAllocatedVUs: 300,

      // max allowed vu
      maxVUs: 600,


      stages: [
        // Start 50 iterations per `timeUnit` for the first minute.
        { target: 50, duration: '1m' },

        // Linearly ramp-up to starting 100 iterations per `timeUnit` over the following two minutes.
        { target: 100, duration: '2m' },

        // Continue starting 200 iterations per `timeUnit` for the following four minutes.
        { target: 300, duration: '4m' }
      ],
    },
    constant: {
      executor: 'constant-arrival-rate',

      // test duration
      duration: '5m',

      // test rate
      rate: 300,

      // It should start `rate` iterations per second
      timeUnit: '1s',

      // pre-allocate vu
      preAllocatedVUs: 300,

      // max allowed vu
      maxVUs: 600,

      // start time calculated on ramping scenarios termination time
      startTime: '7m',

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