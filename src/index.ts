import * as express from "express";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import * as PR from "io-ts/PathReporter";
import { Config } from "./types";
import { log } from "./utils/logger";
import mainRouter from "./routes/main_router";

export const createApp = (config: Config): express.Application => {
  const app = express();

  // parse json bodies
  app.use(express.json());

  // parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // ROUTES
  app.use(mainRouter);

  app.listen(config.SERVER_PORT, () => {
    log.info(`SERVER LISTENING ON PORT ${config.SERVER_PORT}`);
  });

  process.on("SIGINT", () => {
    log.info("RECEIVED SIGINT, CLOSING APPLICATION...");
    process.exit(0);
  });

  return app;
};

export const getConfig = (env: NodeJS.ProcessEnv): E.Either<Errors, Config> =>
  pipe(env, Config.decode);

pipe(
  getConfig(process.env),
  E.map(config => createApp(config)),
  E.mapLeft(err => {
    log.error(`Error while starting the server: ${PR.failure(err).join("\n")}`);
    throw new Error(
      "Error while starting the server: " + PR.failure(err).join("\n")
    );
  })
);
