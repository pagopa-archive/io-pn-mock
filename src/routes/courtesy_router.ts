import { Router } from "express";
import * as express from "express";
import { wrapRequestHandler } from "@pagopa/ts-commons/lib/request_middleware";
import { courtesyGetHandler, courtesyPutHandler } from "../handlers/courtesy";
import { functionsServicesClient } from "../utils/config";

const router: Router = express.Router();
router.get(
  "/address-book-io/v1/digital-address/courtesy",
  wrapRequestHandler(courtesyGetHandler)
);

router.put(
  "/address-book-io/v1/digital-address/courtesy",
  wrapRequestHandler(courtesyPutHandler(functionsServicesClient))
);

export default router;
