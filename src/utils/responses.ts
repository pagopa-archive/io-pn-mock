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

export type IPNResponseErrorProblem = IPNResponse<"IResponseErrorProblem">;

/**
Return a response with 400
 */
export const PNResponseErrorProblem = (
  title: string,
  detail: string,
  errors: ReadonlyArray<ProblemError>
): IPNResponseErrorProblem => ({
  ...ResponseErrorGeneric(HttpStatusCodeEnum.HTTP_STATUS_400, title, detail),
  detail,
  errors,
  kind: "IResponseErrorProblem"
});
