import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    constant: {
      executor: 'constant-arrival-rate',

      // test duration
      duration: '1m',

      // test rate
      rate: 10,

      // It should start `rate` iterations per second
      timeUnit: '1s',

      // pre-allocate vu
      preAllocatedVUs: 300,

      // max allowed vu
      maxVUs: 600,

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

export default function () {

  var apiKey = `${__ENV.API_KEY}`
  var hostName = `${__ENV.HOST_NAME}`

var url = `https://${hostName}/user-registry/${apiVersion}/users/7aedcb66-e64a-445e-910d-7270ce9487b1?fl=familyName&fl=name&fl=fiscalCode`;

var params = {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
};
var r = http.get(url, params);

check(r, {
  'status is 200': (r) => r.status === 200,
});


if (r.status === 429) {
  throttling.add(1);
  console.log(`Status ${r.status}`);
}

if (r.status != 200) {
  console.log(`Status ${r.status}`);
}

}