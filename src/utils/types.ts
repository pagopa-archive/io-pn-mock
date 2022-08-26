import * as t from "io-ts";
import { wrapWithKind } from "@pagopa/io-functions-commons/dist/src/utils/types";
import {
  BaseModel,
  CosmosResource
} from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";
import { IoCourtesyDigitalAddressActivation } from "../generated/IoCourtesyDigitalAddressActivation";

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

export const LegalFactType = t.union([
  t.literal("SENDER_ACK"),
  t.literal("DIGITAL_DELIVERY"),
  t.literal("ANALOG_DELIVERY"),
  t.literal("RECIPIENT_ACCESS")
]);

export type LegalFactType = t.TypeOf<typeof LegalFactType>;
