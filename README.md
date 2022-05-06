# Person Data Vault load tests
K6 scripts to run load tests for Personal Data Vault api(s)

**Important** some of this load tests use the k6 extension [xk6-faker](https://github.com/szkiba/xk6-faker). Please follow the instructions in github to install it.

## 01 Put token

```bash
k6 run -e HOST_NAME=[api.tokenizer.pdv.pagopa.it|api.uat.tokenizer.pdv.pagopa.it] -e API_KEY=<application gateway api key> \
--vus 10 --duration 60s 01-put-tokens.js
```

## 02 Get tokens

```bash
k6 run -e HOST_NAME=[api.tokenizer.pdv.pagopa.it|api.uat.tokenizer.pdv.pagopa.it] -e API_KEY=<application gateway api key> \
-e TOKEN=<token id> --vus 10 --duration 60s 02-get-token.js
```

## 03 Post token

```bash
k6 run -e HOST_NAME=[api.tokenizer.pdv.pagopa.it|api.uat.tokenizer.pdv.pagopa.it] \
-e API_KEY=<application gateway api key>  03-post-token.js
```

## 04 Patch users 

```bash
./k6 run -e HOST_NAME=[api.pdv.pagopa.it|api.uat.pdv.pagopa.it] \
-e API_KEY=<application gateway api key> 04-patch-users.js 
```