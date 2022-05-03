# Person Data Vault load tests
K6 scripts to run load tests for Personal Data Vault api(s)


## 01 Put token

```bash
k6 run -e HOST_NAME=[api.pdv.pagopa.it|api.uat.pdv.pagopa.it] -e API_KEY=<application gateway api key> \
--vus 10 --duration 60s 01-put-tokens.js
```

## 02 Get tokens

```bash
k6 run -e HOST_NAME=[api.pdv.pagopa.it|api.uat.pdv.pagopa.it] -e API_KEY=<application gateway api key> \
-e TOKEN=<token id> --vus 10 --duration 60s 02-get-token.js
```

## 03 Post token

```bash
k6 run -e HOST_NAME=[api.pdv.pagopa.it|api.uat.pdv.pagopa.it] -e API_KEY=<application gateway api key> \
--vus 10 --duration 60s 03-post-token.js
```
