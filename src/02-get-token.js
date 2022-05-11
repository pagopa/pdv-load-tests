import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export let options = {
  // virtual users
  vus: 5,
  // duration: '60s',
  stages: [
    { duration: "2m", target: 10 },
    { duration: "5m", target: 5 }, 
    { duration: "2m", target: 20 },
    { duration: "5m", target: 5 },
  ]  
};

const apiVersion = 'v1'
const throttling = new Counter('throttling');

export default function () {

    var apiKey = `${__ENV.API_KEY}`
    var token =  `${__ENV.TOKEN}`
    var hostName = `${__ENV.HOST_NAME}`

  var url = `https://${hostName}/tokenizer/${apiVersion}/tokens/${token}/pii`;

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
  };
  var r = http.get(url, params);

  console.log(`Status ${r.status}`);

  check(r, {
    'status is 200': (r) => r.status === 200,
  });

  if (r.status === 429) {
    throttling.add(1);
  }

  sleep(0.5);
}