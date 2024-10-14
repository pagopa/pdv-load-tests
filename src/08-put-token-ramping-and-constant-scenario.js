import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    ramping_up: {
      executor: 'ramping-arrival-rate',

      // Start iterations per `timeUnit`
      startRate: 300,

      // Start `startRate` iterations per seconds
      timeUnit: '1s',

      // Pre-allocate necessary VUs.
      preAllocatedVUs: 4000,

      // max allowed vu
      maxVUs: 16000,

      stages: [
        // Start 300 iterations per `timeUnit` for the first minute.
        { target: 600, duration: '1m' },

        // // Linearly ramp-up to starting 1400 iterations per `timeUnit` over the following two minutes.
        { target: 1400, duration: '2m' },

        // // Continue starting 2000 iterations per `timeUnit` for the following two minutes.
        { target: 2000, duration: '2m' }
      ],
    },
    constant: {
      executor: 'constant-arrival-rate',

      // test duration
      duration: '3m',

      // test rate
      rate: 2000,

      // It should start `rate` iterations per second
      timeUnit: '1s',

      // pre-allocate vu
      preAllocatedVUs: 4000,

      // max allowed vu
      maxVUs: 16000,

      // start time calculated on ramping scenarios termination time
      startTime: '5m',

    },
    ramping_down: {
      executor: 'ramping-arrival-rate',

      // Start iterations per `timeUnit`
      startRate: 2000,

      // Start `startRate` iterations per seconds
      timeUnit: '1s',

      // Pre-allocate necessary VUs.
      preAllocatedVUs: 4000,

      // max allowed vu
      maxVUs: 16000,
      
      startTime: '8m',

      stages: [
        // Start 2000 iterations per `timeUnit` for four minutes.
        { target: 1400, duration: '1m' },

        // Linearly ramp-down to starting 600 iterations per `timeUnit` over the following two minutes.
        { target: 600, duration: '2m' },

        // Continue starting 300 iterations per `timeUnit` for the following minute.
        { target: 300, duration: '1m' }
      ],
    },
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
  thresholds: {
    // all thresholds are fulfilled with dummy values 
    // in order to display metrics for each scenario
    http_req_duration: ['max>=0'],
    checks: ['rate>=0'],
}
};

for (let key in options.scenarios) {
  // Each scenario automatically tags the metrics it generates with its own name
  let thresholdHttpReq = `http_req_duration{scenario:${key}}`;
  let thresholdChecks = `checks{scenario:${key}}`;
  // Check to prevent us from overwriting a threshold that already exists
  if (!options.thresholds[thresholdHttpReq]) {
      options.thresholds[thresholdHttpReq] = [];
  }
  if (!options.thresholds[thresholdChecks]) {
    options.thresholds[thresholdChecks] = [];
}
  // uncomment this if you want to override the default threshold
  // options.thresholds[thresholdHttpReq].push('max>=0');
}

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

  check(r, {
    'status is 200': (r) => r.status === 200,
  });

  if (r.status === 429) {
    throttling.add(1);
    console.log(`Status ${r.status}`);
  }

}