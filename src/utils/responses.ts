import {
  HttpStatusCodeEnum,
  IResponse,
  ResponseErrorGeneric
} from "@pagopa/ts-commons/lib/responses";

import { ProblemError } from "../generated/ProblemError";

/**
 * Interface for a PN Response that can be returned by a middleware or
 * by the handlers.
 */
export interface IPNResponse<T> extends IResponse<T> {
  readonly errors: ReadonlyArray<ProblemError>;
}

/**
Return a response with 400
 */
export type IPNResponseErrorValidation = IPNResponse<
  "IResponseErrorValidation"
>;

export const PNResponseErrorValidation = (
  title: string,
  detail: string,
  errors: ReadonlyArray<ProblemError>
): IPNResponseErrorValidation => ({
  ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_400, title, detail),
  detail,
  errors,
  kind: "IResponseErrorValidation"
});

/**
Return a response with 500
 */
export type IPNResponseErrorInternal = IPNResponse<"IResponseErrorInternal">;

export const PNResponseErrorInternal = (
  title: string,
  detail: string,
  errors: ReadonlyArray<ProblemError>
): IPNResponseErrorInternal => ({
  ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_500, title, detail),
  detail,
  errors,
  kind: "IResponseErrorInternal"
});

/**
Return a response with 403
 */
export type IPNResponseErrorForbiddenNotAuthorized = IPNResponse<
  "IResponseErrorForbiddenNotAuthorized"
>;

export const PNResponseErrorForbiddenNotAuthorized = (
  title: string,
  detail: string,
  errors: ReadonlyArray<ProblemError>
): IPNResponseErrorForbiddenNotAuthorized => ({
  ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_403, title, detail),
  detail,
  errors,
  kind: "IResponseErrorForbiddenNotAuthorized"
});

/**
Return a response with 404
 */
export type IPNResponseErrorNotFound = IPNResponse<"IResponseErrorNotFound">;

export const PNResponseErrorNotFound = (
  title: string,
  detail: string,
  errors: ReadonlyArray<ProblemError>
): IPNResponseErrorNotFound => ({
  ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_403, title, detail),
  detail,
  errors,
  kind: "IResponseErrorNotFound"
});
