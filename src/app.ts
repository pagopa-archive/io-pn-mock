import * as express from "express";
import { log } from "./utils/logger";
import mainRouter from "./routes/courtesy_router";

// eslint-disable-next-line @typescript-eslint/no-shadow
export const createApp = (): express.Application => {
  const app = express();

  // parse json bodies
  app.use(express.json());

  // parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // ROUTES
  app.use(mainRouter);

  process.on("SIGINT", () => {
    log.info("RECEIVED SIGINT, CLOSING APPLICATION...");
    process.exit(0);
  });

  return app;
};
