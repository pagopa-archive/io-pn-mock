import * as express from "express";
import { log } from "./utils/logger";
import courtesy_router from "./routes/courtesy_router";
import delivery_router from "./routes/notifications_router";

// eslint-disable-next-line @typescript-eslint/no-shadow
export const createApp = (): express.Application => {
  const app = express();

  // parse json bodies
  app.use(express.json());

  // parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // LOG INFOS FOR ANY RESPONSE (JUST FOR TEST PURPOSES)
  app.use((req, _, next) => {
    log.info(`${req.method} ${req.url}`);
    next();
  });

  // ROUTES
  app.use(courtesy_router);
  app.use(delivery_router);

  process.on("SIGINT", () => {
    log.info("RECEIVED SIGINT, CLOSING APPLICATION...");
    process.exit(0);
  });

  return app;
};
