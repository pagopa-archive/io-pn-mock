import { Container } from "@azure/cosmos";
import { CosmosdbModel } from "@pagopa/io-functions-commons/dist/src/utils/cosmosdb_model";
import { IoCourtesyDigitalAddressActivation } from "../generated/IoCourtesyDigitalAddressActivation";
import { NewActivationDocument, RetrievedActivationDocument } from "../utils/types";

export class UserActivationDocument extends CosmosdbModel<
  IoCourtesyDigitalAddressActivation,
  NewActivationDocument,
  RetrievedActivationDocument
> {
  constructor(container: Container) {
    super(container, NewActivationDocument, RetrievedActivationDocument);
  }
}
