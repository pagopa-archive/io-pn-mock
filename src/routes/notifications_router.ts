import * as express from "express";
import { Router } from "express";
import { wrapRequestHandler } from "@pagopa/ts-commons/lib/request_middleware";
import {
  getReceivedNotificationHandler,
  getSentNotificationDocumentHandler,
  getLegalFactHandler,
  downloadMiddleware
} from "../handlers/notifications";

const router: Router = express.Router();

router.get(
  "/delivery/notifications/received/:iun?",
  wrapRequestHandler(getReceivedNotificationHandler)
);

router.get(
  "/delivery/notifications/sent/:iun?/attachments/documents/:docIdx?",
  wrapRequestHandler(getSentNotificationDocumentHandler)
);

router.get(
  "/delivery-push/:iun?/legal-facts/:legalFactType?/:legalFactId?",
  wrapRequestHandler(getLegalFactHandler)
);

router.get("/download", wrapRequestHandler(downloadMiddleware));

export default router;
