/* eslint-disable sonarjs/no-duplicate-string */
import { Router } from "express";
import * as express from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import {
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorValidation,
  ResponseSuccessJson,
  ResponseSuccessNoContent,
  IResponseSuccessNoContent
} from "@pagopa/ts-commons/lib/responses";
import { wrapRequestHandler } from "@pagopa/ts-commons/lib/request_middleware";
import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { CosmosDecodingError } from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";
import * as PR from "io-ts/PathReporter";
import { log } from "../utils/logger";
import { IoCourtesyDigitalAddressActivation } from "../generated/IoCourtesyDigitalAddressActivation";
import { UserActivationDocument } from "../models/user_activation_document";
import { NewActivationDocument } from "../types";
import { dbInstance } from "../utils/cosmos";

const router: Router = express.Router();

const getHandler = (
  req: express.Request
): Promise<
  | IResponseErrorValidation
  | IResponseSuccessJson<IoCourtesyDigitalAddressActivation>
> =>
  pipe(
    req.headers["x-pagopa-cx-taxid"],
    TE.fromNullable(
      ResponseErrorValidation(
        "Error while processing request",
        "Missing cxTaxIdAuthFleeth header"
      )
    ),
    TE.chainW(fiscalCode => {
      const container = dbInstance.container("ACTIVATIONS");
      const activationDocument = new UserActivationDocument(container);
      return activationDocument.find([
        fiscalCode as string & INonEmptyStringTag
      ]);
    }),
    TE.chainW(
      TE.fromOption(() => ResponseErrorValidation("Error during read", ""))
    ),
    TE.map(activationDocument => ResponseSuccessJson(activationDocument)),
    TE.mapLeft(_ => ResponseErrorValidation("Error during read", "")),
    TE.toUnion
  )();

const putHandler = (
  req: express.Request
): Promise<IResponseErrorValidation | IResponseSuccessNoContent> =>
  pipe(
    req.headers["x-pagopa-cx-taxid"],
    TE.fromNullable<IResponseErrorValidation>(
      ResponseErrorValidation(
        "Error while processing request",
        "Missing cxTaxIdAuthFleeth header"
      )
    ),
    TE.chain(_ =>
      pipe(
        req.body.activationStatus,
        t.boolean.decode,
        E.mapLeft(() =>
          ResponseErrorValidation(
            "Error while processing request",
            "invalid activationStatus parameter in the body request"
          )
        ),
        TE.fromEither
      )
    ),
    TE.chainW(activationStatus => {
      const container = dbInstance.container("ACTIVATIONS");
      const activationDocument = new UserActivationDocument(container);

      const toUpsert = NewActivationDocument.decode({
        activationStatus,
        fiscalCode: req.headers["x-pagopa-cx-taxid"],
        id: req.headers["x-pagopa-cx-taxid"]
      });

      return pipe(
        toUpsert,
        TE.fromEither,
        TE.mapLeft(err => {
          log.error(PR.failure(err).join("\n"));
          return err;
        }),
        TE.mapLeft(CosmosDecodingError),
        TE.chain(data => activationDocument.upsert(data))
      );
    }),
    TE.mapLeft(err => ResponseErrorValidation("Error during upsert", `${err}`)),
    TE.map(_ => ResponseSuccessNoContent()),
    TE.toUnion
  )();

router.get(
  "/address-book-io/v1/digital-address/courtesy",
  wrapRequestHandler(getHandler)
);

router.put(
  "/address-book-io/v1/digital-address/courtesy",
  wrapRequestHandler(putHandler)
);

export default router;
