/* eslint-disable sonarjs/no-duplicate-string */
import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as express from "express";
import {
  IResponseSuccessJson,
  ResponseSuccessJson,
  ResponseSuccessNoContent,
  IResponseSuccessNoContent
} from "@pagopa/ts-commons/lib/responses";
import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import { CosmosDecodingError } from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";
import * as PR from "io-ts/PathReporter";
import { IoCourtesyDigitalAddressActivation } from "../generated/IoCourtesyDigitalAddressActivation";
import { UserActivationDocument } from "../models/user_activation_document";
import { NewActivationDocument } from "../utils/types";
import { dbInstance } from "../utils/cosmos";
import { log } from "../utils/logger";
import { Client } from "../generated/client";
import { ActivationStatusEnum } from "../generated/ActivationStatus";
import { validateTaxIdInHeader } from "../utils/validators";
import {
  IPNResponseErrorForbiddenNotAuthorized,
  IPNResponseErrorInternal,
  PNResponseErrorForbiddenNotAuthorized,
  PNResponseErrorInternal,
  PNResponseErrorNotFound,
  PNResponseErrorValidation,
  IPNResponseErrorValidation,
  IPNResponseErrorNotFound
} from "../utils/responses";

export const courtesyGetHandler = (
  req: express.Request
): Promise<
  | IPNResponseErrorValidation
  | IPNResponseErrorNotFound
  | IPNResponseErrorForbiddenNotAuthorized
  | IPNResponseErrorInternal
  | IResponseSuccessJson<IoCourtesyDigitalAddressActivation>
> =>
  pipe(
    req.headers["x-api-key"],
    TE.fromNullable(
      PNResponseErrorForbiddenNotAuthorized(
        "Forbidden not authorized",
        "The x-api-key was not provided",
        []
      )
    ),
    TE.chainW(() => validateTaxIdInHeader(req)),
    TE.chainW(fiscalCode => {
      const container = dbInstance.container("ACTIVATIONS");
      const activationDocument = new UserActivationDocument(container);

      return pipe(
        activationDocument.find([
          (fiscalCode as unknown) as string & INonEmptyStringTag
        ]),
        TE.mapLeft(err =>
          PNResponseErrorInternal(err.kind, "COSMOS query error", [])
        )
      );
    }),
    TE.chainW(
      TE.fromOption(() =>
        PNResponseErrorNotFound("Error during read", "Not found", [])
      )
    ),
    TE.map(activationDocument => ResponseSuccessJson(activationDocument)),
    TE.toUnion
  )();

export const courtesyPutHandler = (client: Client<"SubscriptionKey">) => (
  req: express.Request
): Promise<
  | IPNResponseErrorValidation
  | IPNResponseErrorForbiddenNotAuthorized
  | IPNResponseErrorInternal
  | IResponseSuccessNoContent
> =>
  pipe(
    req.headers["x-api-key"],
    TE.fromNullable(
      PNResponseErrorForbiddenNotAuthorized(
        "Forbidden not authorized",
        "the x-api-key is invalid",
        []
      )
    ),
    TE.chainW(() => validateTaxIdInHeader(req)),
    TE.bindTo("fiscalCode"),
    TE.bindW("activationStatus", _ =>
      pipe(
        req.body.activationStatus,
        t.boolean.decode,
        E.mapLeft(() =>
          PNResponseErrorValidation(
            "Error while processing request",
            "invalid activationStatus parameter in the body request",
            []
          )
        ),
        TE.fromEither
      )
    ),
    TE.chainW(({ activationStatus, fiscalCode }) => {
      const container = dbInstance.container("ACTIVATIONS");
      const activationDocument = new UserActivationDocument(container);

      const toUpsert = NewActivationDocument.decode({
        activationStatus,
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
        TE.chain(data => activationDocument.upsert(data)),
        // CALLING upsertServiceActivation of io-function-services
        TE.chainW(() =>
          TE.tryCatch(
            () =>
              client.upsertServiceActivation({
                payload: {
                  fiscal_code: fiscalCode,
                  status: activationStatus
                    ? ActivationStatusEnum.ACTIVE
                    : ActivationStatusEnum.INACTIVE
                }
              }),
            err => {
              log.error(`upsertServiceActivation responded with: ${err}`);
              return PNResponseErrorInternal(
                "Not found",
                "Could not update the service activation on functions-services",
                []
              );
            }
          )
        ),
        //
        TE.mapLeft(err =>
          PNResponseErrorInternal(err.kind, "COSMOS query error", [])
        )
      );
    }),
    // The client reject the promise only if something went wrong, like a JSON.parse of the output
    // the response could contain HTTP error codes so it is necessary to filter out the response
    TE.map(
      flow(
        E.map(response => {
          // eslint-disable-next-line sonarjs/no-small-switch
          switch (response.status) {
            case 200:
              return ResponseSuccessNoContent();
            default:
              log.error(
                `upsertServiceActivation returned ${response.status}: ${response.value}`
              );
              return PNResponseErrorInternal(
                "Update error",
                "Could not update the service activation on functions-services",
                []
              );
          }
        }),
        E.getOrElseW(err =>
          PNResponseErrorInternal(
            "Update error",
            `Error while updating the service activation:${PR.failure(err).join(
              "\n"
            )}`,
            []
          )
        )
      )
    ),
    TE.toUnion
  )();
