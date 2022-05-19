#!/bin/bash

HOST='api.pdv.pagopa.it'
API_KEY=${1}
SLEEP=$(( 120 * 60 ))


for i in {1..5}
do
  startat=$(date)
  echo "Rount ${i} [${startat}]"
  plow https://${HOST}/user-registry/v1/users -c 1 -n 100 -d 2m \
    --body @file.json \
    --header=x-api-key:${API_KEY} \
    -T 'application/json' -m PATCH 

  echo "Completed round ${i} Sleep for sec ${SLEEP}"
  sleep ${SLEEP}

done