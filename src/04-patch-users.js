import http from "k6/http";
import { sleep } from "k6";
import { check } from "k6";
import { generateFakeFiscalCode } from "./modules/helpers.js";
import { Faker } from "k6/x/faker";
import { Counter } from "k6/metrics";

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

const apiVersion = "v1";

const throttling = new Counter("throttling");

export default function () {

  let apiKey = `${__ENV.API_KEY}`;
  let hostName = `${__ENV.HOST_NAME}`;

  let url = `https://${hostName}/user-registry/${apiVersion}/users`;

  let params = {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    }
  };

  // const faker = require('faker');
  let faker = new Faker();

  let randomEmail = faker.email();
  let fiscalCode = generateFakeFiscalCode();
  let randomName = faker.firstName();
  let randomFamilyName = faker.lastName();



  let payload = JSON.stringify(
    {
        "birthDate": {
          "certification": "NONE",
          "value": "1986-04-29"
        },
        "email": {
          "certification": "NONE",
          "value": randomEmail
        },
        "familyName": {
          "certification": "NONE",
          "value": randomFamilyName
        },
        "fiscalCode": fiscalCode,
        "name": {
          "certification": "NONE",
          "value": randomName
        },
        "workContacts": {
          "additionalProp1": {
            "email": {
              "certification": "NONE",
              "value": randomEmail
            }
          },
          "additionalProp2": {
            "email": {
              "certification": "NONE",
              "value": randomEmail
            }
          },
          "additionalProp3": {
            "email": {
              "certification": "NONE",
              "value": randomEmail
            }
          }
        }
      }
    );

    let r = http.patch(url, payload, params);

    console.log(`Status ${r.status}`);

    // console.log(`Body ${r.body}`);

    check(r, {
        "status is 200": (r) => r.status === 200
    });

    if (r.status === 429) {
      throttling.add(1);
    }


    sleep(0.5);
}