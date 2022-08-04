#!/bin/bash

RED="\e[31m"
GREEN="\e[32m"
ENDCOLOR="\e[0m"

if [[ -z "${FUNCTIONS_SERVICES_COMMIT_SHA}" ]]; then
  echo -e "${RED}Fallback FUNCTIONS_SERVICES_COMMIT_SHA to master${ENDCOLOR}"
  FUNCTIONS_SERVICES_COMMIT_SHA=master
fi

GEN_API_MODELS_BIN=./node_modules/@pagopa/openapi-codegen-ts/dist/commands/gen-api-models/cli.js

if [[ -f "${GEN_API_MODELS_BIN}" ]]; then
  echo -e "${GREEN}Generating...${ENDCOLOR}"
  command="node ${GEN_API_MODELS_BIN} --api-spec https://raw.githubusercontent.com/pagopa/io-functions-services/${FUNCTIONS_SERVICES_COMMIT_SHA}/openapi/index.yaml --out-dir ./src/generated --strict false --request-types --response-decoders --client"
  echo -e "${GREEN}Running ${command}${ENDCOLOR}"
  eval $command
else
  echo "${RED}gen-api-models command not found, did you run yarn install --frozen-lockfile?${ENDCOLOR}"
  exit 1
fi
