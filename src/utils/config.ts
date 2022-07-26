import { pipe } from "fp-ts/function";
import * as E from "fp-ts/lib/Either";
import type { Errors } from "io-ts";
import * as t from "io-ts";
import { log } from "./logger";

export const Config = t.type({
  COSMOSDB_KEY: t.string,
  COSMOSDB_NAME: t.string,
  COSMOSDB_URI: t.string,
  SERVER_PORT: t.string
});

export type Config = t.TypeOf<typeof Config>;

export const getConfig = (env: NodeJS.ProcessEnv): E.Either<Errors, Config> =>
  pipe(env, Config.decode);

export const config = pipe(
  getConfig(process.env),
  E.getOrElseW(err => {
    log.error(`Error while starting the server: ${err.toString()}`);
    throw new Error(`Error while starting the server: ${err.toString()}`);
  })
);
