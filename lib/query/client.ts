import { defaultShouldDehydrateQuery, isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    // Fresh client per request on the server.
    return makeQueryClient();
  }
  // Stable client across renders in the browser.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
