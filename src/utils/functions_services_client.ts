import nodeFetch from "node-fetch";
import { Client, createClient } from "../generated/client";

export const generateFunctionsServicesClient = (
  baseUrl: string,
  token: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchApi: typeof fetch = (nodeFetch as any) as typeof fetch
): Client<"SubscriptionKey"> =>
  createClient<"SubscriptionKey">({
    basePath: "",
    baseUrl,
    fetchApi,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    withDefaults: op => params =>
      op({
        ...params,
        SubscriptionKey: token
      })
  });
