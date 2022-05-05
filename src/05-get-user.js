import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { Counter } from 'k6/metrics';


export let options = {
  // virtual users
  vus: 5,
  // duration: '60s',
  stages: [
    { duration: "2m", target: 10 }, // below normal load
    { duration: "5m", target: 5 }, 
    { duration: "2m", target: 20 }, // normal load
    { duration: "5m", target: 5 },
    //{ duration: "2m", target: 300 }, // around the breaking point
    //{ duration: "5m", target: 300 },
    //{ duration: "2m", target: 400 }, // beyond the breaking point
    //{ duration: "5m", target: 400 }, 
    //{ duration: "10m", target: 0 },  // scale down. Recovery stage.
  ]  
};

const apiVersion = 'v1'

const throttling = new Counter('throttling');



export default function () {

    var apiKey = `${__ENV.API_KEY}`
    var id =  `${__ENV.USER_ID}`
    var hostName = `${__ENV.HOST_NAME}`

  var url = `https://${hostName}/user-registry/${apiVersion}/users/${id}?fl=workContacts`;

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

  sleep(1);
}