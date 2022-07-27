/* eslint-disable sonarjs/no-duplicate-string */
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as express from "express";
import {
  IResponseErrorValidation,
  IResponseSuccessJson,
  ResponseErrorValidation,
  ResponseSuccessJson,
  ResponseSuccessNoContent,
  IResponseSuccessNoContent,
  ResponseErrorNotFound,
  IResponseErrorNotFound,
  ResponseErrorForbiddenNotAuthorized,
  IResponseErrorForbiddenNotAuthorized,
  ResponseErrorInternal,
  IResponseErrorInternal
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
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { ActivationStatusEnum } from "../generated/ActivationStatus";

const validateTaxIdHeader = (req: express.Request) => (): TE.TaskEither<
  IResponseErrorValidation,
  FiscalCode
> =>
  pipe(
    req.headers["x-pagopa-cx-taxid"],
    FiscalCode.decode,
    E.mapLeft(() => ResponseErrorValidation(
      "Error while processing request",
      "Missing x-pagopa-cx-taxid header"
    )),
    TE.fromEither
  );

export const courtesyGetHandler = (
  req: express.Request
): Promise<
  | IResponseErrorValidation
  | IResponseErrorNotFound
  | IResponseErrorForbiddenNotAuthorized
  | IResponseErrorInternal
  | IResponseSuccessJson<IoCourtesyDigitalAddressActivation>
> =>
  pipe(
    req.headers["x-api-key"],
    TE.fromNullable(ResponseErrorForbiddenNotAuthorized),
    TE.chainW(validateTaxIdHeader(req)),
    TE.chainW(fiscalCode => {
      const container = dbInstance.container("ACTIVATIONS");
      const activationDocument = new UserActivationDocument(container);

      return pipe(
        activationDocument.find([fiscalCode as unknown as string & INonEmptyStringTag]),
        TE.mapLeft(err => ResponseErrorInternal(err.kind))
      );
    }),
    TE.chainW(
      TE.fromOption(() =>
        ResponseErrorNotFound("Error during read", "Not found")
      )
    ),
    TE.map(activationDocument => ResponseSuccessJson(activationDocument)),
    TE.toUnion
  )();

export const courtesyPutHandler = (client: Client<"SubscriptionKey">
) => (
  req: express.Request
): Promise<
  | IResponseErrorValidation
  | IResponseErrorForbiddenNotAuthorized
  | IResponseErrorInternal
  | IResponseSuccessNoContent
> =>
    pipe(
      req.headers["x-api-key"],
      TE.fromNullable(ResponseErrorForbiddenNotAuthorized),
      TE.chainW(validateTaxIdHeader(req)),
      TE.bindTo("fiscalCode"),
      TE.bindW("activationStatus", _ =>
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
            TE.tryCatch(() => client.upsertServiceActivation(
              {
                payload:
                  { fiscal_code: fiscalCode, status: activationStatus ? ActivationStatusEnum.ACTIVE : ActivationStatusEnum.INACTIVE }
              }),
              () => ResponseErrorInternal("Could not update the service activation on functions-services"))
          ),
          //
          TE.mapLeft(err => ResponseErrorInternal(err.kind))
        );
      }),
      TE.map(_ => ResponseSuccessNoContent()),
      TE.toUnion
    )();
