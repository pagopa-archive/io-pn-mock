import { pipe } from "fp-ts/lib/function";

import * as express from "express";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { FiscalCode } from "../generated/FiscalCode";
import {
  validIunList,
  validLegalFactList,
  validDocIdxIdList
} from "../__mocks__/variables";
import { LegalFactType } from "./types";
import {
  IPNResponseErrorForbiddenNotAuthorized,
  IPNResponseErrorValidation,
  PNResponseErrorForbiddenNotAuthorized,
  PNResponseErrorValidation
} from "./responses";

export const validateTaxIdInHeader = (
  req: express.Request
): TE.TaskEither<IPNResponseErrorValidation, FiscalCode> =>
  pipe(
    req.headers["x-pagopa-cx-taxid"],
    FiscalCode.decode,
    E.mapLeft(() =>
      PNResponseErrorValidation(
        "Invalid taxId",
        "taxId must be provided inside headers",
        []
      )
    ),
    TE.fromEither
  );

// INFO: while testing the API, i found out that if the x-api-key was not provided it would return 403,
// however this is not specified in the spec
export const validateXApiKeyInHeader = (
  req: express.Request
): TE.TaskEither<
  IPNResponseErrorForbiddenNotAuthorized,
  string | ReadonlyArray<string>
> =>
  pipe(
    req.headers["x-api-key"],
    TE.fromNullable(
      PNResponseErrorForbiddenNotAuthorized(
        "Forbidden not authorized",
        "The x-api-key was not provided",
        []
      )
    )
  );

/**
Check whether the iun is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateIun = (
  iun: unknown
): TE.TaskEither<IPNResponseErrorValidation, string> =>
  pipe(
    validIunList,
    TE.fromPredicate(
      validList => validList.includes(iun as string),
      () => "The iun provided is not valid, please check for existance"
    ),
    TE.mapLeft((errorMessage: string) =>
      PNResponseErrorValidation("Invalid IUN", errorMessage, [])
    ),
    TE.map(() => iun as string)
  );

/**
Check whether the docIdx is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateDocIdx = (
  docIdx: unknown
): TE.TaskEither<IPNResponseErrorValidation, string> =>
  pipe(
    validDocIdxIdList,
    TE.fromPredicate(
      validList => validList.includes(docIdx as string),
      () => "The docIdx is not valid"
    ),
    TE.mapLeft(() =>
      PNResponseErrorValidation(
        "Invalid docIdx",
        "docIdx must be provided inside params as non empty string",
        []
      )
    ),
    TE.map(() => docIdx as string)
  );

/**
Check whether the legalFactType is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateLegalFactType = (
  legalFactType: unknown
): TE.TaskEither<IPNResponseErrorValidation, LegalFactType> =>
  pipe(
    LegalFactType.decode(legalFactType),
    TE.fromEither,
    TE.mapLeft(() =>
      PNResponseErrorValidation(
        "Invalid legalFactType",
        "legalFactType must be one of the following: SENDER_ACK | DIGITAL_DELIVERY | ANALOG_DELIVERY | RECIPIENT_ACCESS",
        []
      )
    )
  );

/**
Check whether the legalFactId is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateLegalFactId = (
  legalFactId: unknown
): TE.TaskEither<IPNResponseErrorValidation, string> =>
  pipe(
    validLegalFactList,
    TE.fromPredicate(
      () => validLegalFactList.some(e => e.key === legalFactId),
      () => "Invalid legalFactId, please check for existance"
    ),
    TE.mapLeft(errorMessage =>
      PNResponseErrorValidation("Invalid legalFactId", errorMessage, [])
    ),
    TE.map(() => legalFactId as string)
  );
