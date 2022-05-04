import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { generateFakeFiscalCode } from './modules/helpers.js';
import { Faker } from "k6/x/faker"

export default function () {

  var apiKey = `${__ENV.API_KEY}`
  var hostName = `${__ENV.HOST_NAME}`

  var url = `https://${hostName}/user-registry/users`;

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
  };

  // const faker = require('faker');
  let faker = new Faker();
 
  var randomEmail = faker.email();
  var fiscalCode = generateFakeFiscalCode();
  var randomName = faker.firstName();
  var randomFamilyName = faker.lastName();
  
  

  var payload = JSON.stringify(
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

    var r = http.patch(url, payload, params);

    console.log(`Status ${r.status}`);

    console.log(`Body ${r.body}`);

    check(r, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}