import { pipe } from "fp-ts/function";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { mockedConfig } from "../__mocks__/variables";
import { generateFunctionsServicesClient } from "./functions_services_client";
import { log } from "./logger";

export const Config = t.type({
  COSMOSDB_KEY: t.string,
  COSMOSDB_NAME: t.string,
  COSMOSDB_URI: t.string,
  IO_FUNCTION_SERVICES_BASE_URL: t.string,
  IO_FUNCTION_SERVICES_TOKEN: t.string,
  SERVER_PORT: t.string
});

export type Config = t.TypeOf<typeof Config>;

export const getConfig = (env: NodeJS.ProcessEnv): E.Either<t.Errors, Config> =>
  env.NODE_ENV === "test" ? Config.decode(mockedConfig) : Config.decode(env);

export const config = pipe(
  getConfig(process.env),
  E.getOrElseW(err => {
    log.error(`Error while starting the server: ${err.toString()}`);
    throw new Error(`Error while starting the server: ${err.toString()}`);
  })
);

export const functionsServicesClient = generateFunctionsServicesClient(
  config.IO_FUNCTION_SERVICES_BASE_URL,
  config.IO_FUNCTION_SERVICES_TOKEN
);
