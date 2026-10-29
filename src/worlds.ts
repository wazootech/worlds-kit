import type { WorldsKitDataSource, WorldsKitDataSourceOptions } from "./types";

export type CreateDataSourceOptions = {
  token?: string;
  worldId?: string;
};

export function createWorldsKitDataSource(
  endpoint: string,
  tokenOrOptions?: string | CreateDataSourceOptions,
  options?: CreateDataSourceOptions,
): WorldsKitDataSource {
  const token =
    typeof tokenOrOptions === "string" ? tokenOrOptions : tokenOrOptions?.token;
  const defaultWorldId =
    typeof tokenOrOptions === "object"
      ? tokenOrOptions?.worldId
      : options?.worldId;

  const requestHeaders = {
    Accept: "application/sparql-results+json, application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const resolveUrl = (targetWorldId?: string) => {
    let url = endpoint.replace(/\/+$/, "");
    if (!url.includes("/sparql")) {
      const worldId = targetWorldId || defaultWorldId;
      if (worldId) {
        url = `${url}/worlds/${encodeURIComponent(worldId)}/sparql`;
      }
    }
    return url;
  };

  return {
    async query(sparql: string, options?: WorldsKitDataSourceOptions) {
      const url = resolveUrl(options?.worldId);
      const isWorldsApi = url.includes("/worlds/");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...requestHeaders,
          "Content-Type": isWorldsApi
            ? "application/json"
            : "application/sparql-query",
        },
        body: isWorldsApi ? JSON.stringify({ query: sparql }) : sparql,
        signal: options?.signal,
      });
      if (!response.ok)
        throw new Error(`Worlds query failed (${response.status})`);
      return (await response.json()) as unknown;
    },
    async mutate(update: string, options?: WorldsKitDataSourceOptions) {
      const url = resolveUrl(options?.worldId);
      const isWorldsApi = url.includes("/worlds/");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...requestHeaders,
          Accept: "application/json",
          "Content-Type": isWorldsApi
            ? "application/json"
            : "application/sparql-query",
        },
        body: isWorldsApi ? JSON.stringify({ query: update }) : update,
        signal: options?.signal,
      });
      if (!response.ok)
        throw new Error(`Worlds mutation failed (${response.status})`);
      const responseText = await response.text();
      return responseText ? (JSON.parse(responseText) as unknown) : undefined;
    },
    subscribe(
      sparql: string,
      onData: (result: unknown) => void,
      onError: (error: Error) => void,
      options?: WorldsKitDataSourceOptions & { pollIntervalMs?: number },
    ) {
      let active = true;
      const pollInterval = options?.pollIntervalMs ?? 3000;

      const run = async () => {
        try {
          const data = await this.query(sparql, options);
          if (active) onData(data);
        } catch (err) {
          if (active && (err as Error).name !== "AbortError") {
            onError(err as Error);
          }
        }
      };

      void run();
      const timer = setInterval(() => {
        void run();
      }, pollInterval);

      return () => {
        active = false;
        clearInterval(timer);
      };
    },
  };
}

export {
  bindingValue,
  datasetIri,
  encodeIri,
  itemIri,
  literal,
  predicateIri,
  queryBindings,
  sparqlValue,
  worldIri,
} from "./worlds-terms";
