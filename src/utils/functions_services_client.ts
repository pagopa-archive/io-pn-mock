import nodeFetch from "node-fetch";
import { createClient } from "../generated/client";

export const generateFunctionsServicesClient = (
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = (nodeFetch as any) as typeof fetch
) =>
  createClient<"SubscriptionKey">({
    baseUrl,
    basePath: "",
    fetchApi,
    withDefaults: op => params =>
      op({
        ...params,
        SubscriptionKey: token
      })
  });
