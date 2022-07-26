import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { initContainers } from "./utils/cosmos";
import { config } from "./utils/config";
import { log } from "./utils/logger";
import { createApp } from "./app";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const init = async () =>
  await pipe(
    createApp(),
    TE.of,
    TE.map(app => {
      app.listen(config.SERVER_PORT, () => {
        log.info(`SERVER LISTENING ON PORT ${config.SERVER_PORT}`);
      });
    }),
    // init db containers
    TE.chainFirst(initContainers),
    TE.mapLeft(_ => {
      log.error("Error while starting the server");
    })
  )();

init().catch(() => {
  process.exit(1);
});
