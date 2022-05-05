import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

/*
export let options = {
  // virtual users
  vus: 10,
  duration: '30s',
};
*/

const apiVersion = 'v1'

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

  sleep(1);
}