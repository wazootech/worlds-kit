import type {
  WorldsKitDataSource,
  WorldsKitDataSourceOptions,
  WorldsKitQueryResult,
} from "./types";

const namespace = "https://kit.wazoo.dev/";
const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

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
    async query<T>(sparql: string, options?: WorldsKitDataSourceOptions) {
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
      return (await response.json()) as T;
    },
    async mutate<T>(update: string, options?: WorldsKitDataSourceOptions) {
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
      return (responseText ? JSON.parse(responseText) : undefined) as T;
    },
    subscribe<T = WorldsKitQueryResult>(
      sparql: string,
      onData: (result: T) => void,
      onError: (error: Error) => void,
      options?: WorldsKitDataSourceOptions & { pollIntervalMs?: number },
    ) {
      let active = true;
      const pollInterval = options?.pollIntervalMs ?? 3000;

      const run = async () => {
        try {
          const data = await this.query<T>(sparql, options);
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

export function worldIri(worldId: string) {
  return `${namespace}world/${encodeURIComponent(worldId)}`;
}
export function itemIri(worldId: string, id: string) {
  return `${worldIri(worldId)}/item/${encodeURIComponent(id)}`;
}
export function datasetIri(worldId: string, id: string) {
  return `${worldIri(worldId)}/dataset/${encodeURIComponent(id)}`;
}
export function predicateIri(name: string) {
  return `${namespace}${encodeURIComponent(name)}`;
}
export function encodeIri(iri: string) {
  return `<${iri.replace(/[<>\s]/g, "")}>`;
}

export function literal(value: unknown): string {
  if (typeof value === "boolean") return `"${value}"^^<${xsdNamespace}boolean>`;
  if (typeof value === "number" && Number.isFinite(value))
    return `"${value}"^^<${xsdNamespace}${Number.isInteger(value) ? "integer" : "double"}>`;
  if (value instanceof Date)
    return `"${value.toISOString()}"^^<${xsdNamespace}dateTime>`;
  return JSON.stringify(String(value ?? ""));
}

export function sparqlValue(value: unknown) {
  if (typeof value === "string" && /^https?:\/\//.test(value))
    return encodeIri(value);
  return literal(value);
}

export function queryBindings<T = Record<string, unknown>>(result: any): T[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.results?.bindings)) return result.results.bindings;
  if (Array.isArray(result.results)) return result.results;
  if (Array.isArray(result.bindings)) return result.bindings;
  return [];
}

export function bindingValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "value" in value)
    return (value as { value: unknown }).value;
  return value;
}
