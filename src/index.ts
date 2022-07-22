import * as express from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { initContainers } from "./utils/cosmos";
import { Config } from "./types";
import { config } from "./utils/config";
import { log } from "./utils/logger";
import mainRouter from "./routes/main_router";

// eslint-disable-next-line @typescript-eslint/no-shadow
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const init = async () =>
  await pipe(
    createApp(config),
    TE.of,
    // init db containers
    TE.chainFirst(initContainers),
    TE.mapLeft(_ => {
      log.error("Error while starting the server");
    })
  )();

init().catch(() => {
  process.exit(1);
});
