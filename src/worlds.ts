import type { WorldsKitDataSource, WorldsKitQueryResult } from "./types";

const namespace = "https://wazoo.dev/worlds-kit/";
const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

export function createWorldsKitDataSource(endpoint: string, token?: string): WorldsKitDataSource {
  const requestHeaders = {
    Accept: "application/sparql-results+json, application/json",
    "Content-Type": "application/sparql-query",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return {
    async query<T>(sparql: string, options?: { signal?: AbortSignal }) {
      const response = await fetch(endpoint, { method: "POST", headers: requestHeaders, body: sparql, signal: options?.signal });
      if (!response.ok) throw new Error(`Worlds query failed (${response.status})`);
      return await response.json() as T;
    },
    async mutate<T>(update: string, options?: { signal?: AbortSignal }) {
      const response = await fetch(endpoint, { method: "POST", headers: { ...requestHeaders, Accept: "application/json" }, body: update, signal: options?.signal });
      if (!response.ok) throw new Error(`Worlds mutation failed (${response.status})`);
      const responseText = await response.text();
      return (responseText ? JSON.parse(responseText) : undefined) as T;
    },
  };
}

export function worldIri(worldId: string) { return `${namespace}world/${encodeURIComponent(worldId)}`; }
export function itemIri(worldId: string, id: string) { return `${worldIri(worldId)}/item/${encodeURIComponent(id)}`; }
export function datasetIri(worldId: string, id: string) { return `${worldIri(worldId)}/dataset/${encodeURIComponent(id)}`; }
export function predicateIri(name: string) { return `${namespace}${encodeURIComponent(name)}`; }
export function encodeIri(iri: string) { return `<${iri.replace(/[<>\s]/g, "")}>`; }

export function literal(value: unknown): string {
  if (typeof value === "boolean") return `"${value}"^^<${xsdNamespace}boolean>`;
  if (typeof value === "number" && Number.isFinite(value)) return `"${value}"^^<${xsdNamespace}${Number.isInteger(value) ? "integer" : "double"}>`;
  if (value instanceof Date) return `"${value.toISOString()}"^^<${xsdNamespace}dateTime>`;
  return JSON.stringify(String(value ?? ""));
}

export function sparqlValue(value: unknown) {
  if (typeof value === "string" && /^https?:\/\//.test(value)) return encodeIri(value);
  return literal(value);
}

export function queryBindings<T>(result: WorldsKitQueryResult<T> | T[]): T[] {
  if (Array.isArray(result)) return result;
  return result.results ?? result.bindings ?? [];
}

export function bindingValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "value" in value) return (value as { value: unknown }).value;
  return value;
}
