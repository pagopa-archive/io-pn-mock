import { pipe } from "fp-ts/lib/function";
import { Request } from "express";
import {
  IResponseSuccessJson,
  ResponseSuccessJson
} from "@pagopa/ts-commons/lib/responses";

import * as TE from "fp-ts/lib/TaskEither";
import { FullReceivedNotification } from "../generated/FullReceivedNotification";
import { IPNResponseErrorProblem } from "../utils/responses";
import {
  aValidFullReceivedNotification,
  aValidLegalFactDownloadMetadataResponse,
  aValidNotificationAttachmentDownloadMetadataResponse
} from "../__mocks__/variables";
import { NotificationAttachmentDownloadMetadataResponse } from "../generated/NotificationAttachmentDownloadMetadataResponse";
import {
  validateDocIdx,
  validateIun,
  validateLegalFactId,
  validateLegalFactType,
  validateTaxIdInHeader
} from "../utils/validators";
import { LegalFactDownloadMetadataResponse } from "../generated/LegalFactDownloadMetadataResponse";

export const getReceivedNotificationHandler = (
  req: Request
): Promise<
  IResponseSuccessJson<FullReceivedNotification> | IPNResponseErrorProblem
> =>
  pipe(
    validateIun(req.params.iun),
    TE.map(() => ResponseSuccessJson(aValidFullReceivedNotification)),
    TE.toUnion
  )();

export const getSentNotificationDocumentHandler = (
  req: Request
): Promise<
  | IResponseSuccessJson<NotificationAttachmentDownloadMetadataResponse>
  | IPNResponseErrorProblem
> =>
  pipe(
    validateTaxIdInHeader(req)(),
    TE.chain(() => validateIun(req.params.iun)),
    TE.chain(() => validateDocIdx(req.params.docIdx)),
    TE.map(() =>
      ResponseSuccessJson(aValidNotificationAttachmentDownloadMetadataResponse)
    ),
    TE.toUnion
  )();

export const getLegalFactHandler = (
  req: Request
): Promise<
  | IResponseSuccessJson<LegalFactDownloadMetadataResponse>
  | IPNResponseErrorProblem
> =>
  pipe(
    validateTaxIdInHeader(req)(),
    TE.chain(() => validateIun(req.params.iun)),
    TE.chain(() => validateLegalFactType(req.params.legalFactType)),
    TE.chain(() => validateLegalFactId(req.params.legalFactId)),
    TE.map(() => ResponseSuccessJson(aValidLegalFactDownloadMetadataResponse)),
    TE.toUnion
  )();

export const downloadMiddleware = (
  _: Request
): Promise<IResponseSuccessJson<Buffer>> =>
  pipe(ResponseSuccessJson(Buffer.from("Hello world!")), TE.of, TE.toUnion)();
