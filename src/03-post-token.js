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

const random = (length = 8) => {
  // Declare all characters
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  // Pick characers randomly
  let str = '';
  for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;

};

export default function () {

    var apiKey = `${__ENV.API_KEY}`
    var hostName = `${__ENV.HOST_NAME}`

  var url = `https://${hostName}/tokenizer/${apiVersion}/tokens/search`;

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

  var r = http.post(url, payload, params);

  console.log(`Status ${r.status}`);

  check(r, {
    'status is 200': (r) => r.status === 200,
  });
  if (r.status === 429) {
    throttling.add(1);
  }

  sleep(0.5);

}