import * as t from "io-ts";
import { wrapWithKind } from "@pagopa/io-functions-commons/dist/src/utils/types";
import {
  BaseModel,
  CosmosResource
} from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";
import { IoCourtesyDigitalAddressActivation } from "../generated/IoCourtesyDigitalAddressActivation";

export const Config = t.type({
  COSMOSDB_KEY: t.string,
  COSMOSDB_NAME: t.string,
  COSMOSDB_URI: t.string,
  SERVER_PORT: t.string
});

export type Config = t.TypeOf<typeof Config>;

export const NewActivationDocument = wrapWithKind(
  t.intersection([IoCourtesyDigitalAddressActivation, BaseModel]),
  "INewPNActivationModel"
);

export type NewActivationDocument = t.TypeOf<typeof NewActivationDocument>;

export const RetrievedActivationDocument = wrapWithKind(
  t.intersection([IoCourtesyDigitalAddressActivation, CosmosResource]),
  "IRetrievedPNActivationModel"
);

export type RetrievedActivationDocument = t.TypeOf<
  typeof RetrievedActivationDocument
>;
