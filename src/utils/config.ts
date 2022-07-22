import { pipe } from "fp-ts/function";
import * as E from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { Config } from "../types";
import { log } from "./logger";

export const getConfig = (env: NodeJS.ProcessEnv): E.Either<Errors, Config> =>
  pipe(env, Config.decode);

export const config = pipe(
  getConfig(process.env),
  E.getOrElseW(err => {
    log.error(`Error while starting the server: ${err.toString()}`);
    throw new Error("Error while starting the server: " + err.toString());
  })
);
