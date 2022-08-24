import {
  IResponseErrorValidation,
  ResponseErrorValidation
} from "@pagopa/ts-commons/lib/responses";
import { pipe } from "fp-ts/lib/function";

import * as express from "express";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { FiscalCode } from "../generated/FiscalCode";
import { validIunList, validLegalFactList } from "../__mocks__/variables";
import { LegalFactType } from "./types";
import { IPNResponseErrorProblem, PNResponseErrorProblem } from "./responses";

//this function should be replaced with the nearly next one, i'm not removing this at the moment to not break anything
export const validateTaxIdHeader = (req: express.Request) => (): TE.TaskEither<
  IResponseErrorValidation,
  FiscalCode
> =>
  pipe(
    req.headers["x-pagopa-cx-taxid"],
    FiscalCode.decode,
    E.mapLeft(() =>
      ResponseErrorValidation(
        "Error while processing request",
        "Missing x-pagopa-cx-taxid header"
      )
    ),
    TE.fromEither
  );

export const validateTaxIdInHeader = (
  req: express.Request
) => (): TE.TaskEither<IPNResponseErrorProblem, FiscalCode> =>
  pipe(
    req.headers["x-pagopa-cx-taxid"],
    FiscalCode.decode,
    E.mapLeft(() =>
      PNResponseErrorProblem(
        "Invalid taxId",
        "taxId must be provided inside headers",
        []
      )
    ),
    TE.fromEither
  );

/**
Check whether the iun is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateIun = (
  iun: unknown
): TE.TaskEither<IPNResponseErrorProblem, string> =>
  pipe(
    validIunList,
    TE.fromPredicate(
      validList => validList.includes(iun as string),
      () => "The iun provided is not valid, please check for existance"
    ),
    TE.mapLeft((errorMessage: string) =>
      PNResponseErrorProblem("Invalid IUN", errorMessage, [])
    ),
    TE.map(() => iun as string)
  );

/**
Check whether the docIdx is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateDocIdx = (
  docIdx: unknown
): TE.TaskEither<IPNResponseErrorProblem, string> =>
  pipe(
    NonEmptyString.decode(docIdx),
    TE.fromEither,
    TE.mapLeft(() =>
      PNResponseErrorProblem(
        "Invalid docIdx",
        "docIdx must be provided inside params as non empty string",
        []
      )
    ),
    TE.map((idx: string) => idx)
  );

/**
Check whether the legalFactType is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateLegalFactType = (
  legalFactType: unknown
): TE.TaskEither<IPNResponseErrorProblem, LegalFactType> =>
  pipe(
    LegalFactType.decode(legalFactType),
    TE.fromEither,
    TE.mapLeft(() =>
      PNResponseErrorProblem(
        "Invalid legalFactType",
        "legalFactType must be one of the following: SENDER_ACK | DIGITAL_DELIVERY | ANALOG_DELIVERY | RECIPIENT_ACCESS",
        []
      )
    ),
    TE.map((lft: LegalFactType) => lft)
  );

/**
Check whether the legalFactId is valid, if so it is returned, otherwise a PNResponseErrorProblem is sent
 */
export const validateLegalFactId = (
  legalFactId: unknown
): TE.TaskEither<IPNResponseErrorProblem, string> =>
  pipe(
    validLegalFactList,
    TE.fromPredicate(
      () => validLegalFactList.some(e => e.key === legalFactId),
      () => "Invalid legalFactId, please check for existance"
    ),
    TE.mapLeft(errorMessage =>
      PNResponseErrorProblem("Invalid legalFactId", errorMessage, [])
    ),
    TE.map(() => legalFactId as string)
  );
