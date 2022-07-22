import { CosmosClient, Database, ContainerResponse } from "@azure/cosmos";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { config } from "../utils/config";
import { log } from "../utils/logger";

export const dbClient: CosmosClient = new CosmosClient({
  endpoint: config.COSMOSDB_URI,
  key: config.COSMOSDB_KEY
});

export const dbInstance: Database = dbClient.database(config.COSMOSDB_NAME);

export const initContainers = (): TE.TaskEither<Error, ContainerResponse> =>
  pipe(
    TE.tryCatch(
      () => {
        log.info(`CREATING DATABASE: ${config.COSMOSDB_NAME}`);
        return dbClient.databases.createIfNotExists({
          id: config.COSMOSDB_NAME
        });
      },
      err => {
        log.error(err);
        return new Error("Error while creating database");
      }
    ),
    TE.chain(() =>
      TE.tryCatch(
        () => {
          log.info("CREATING CONTAINER: ACTIVATIONS");
          return dbInstance.containers.createIfNotExists({
            id: "ACTIVATIONS",
            partitionKey: "/fiscalCode"
          });
        },
        err => {
          log.error(err);
          return new Error("Error while creating containers");
        }
      )
    )
  );
