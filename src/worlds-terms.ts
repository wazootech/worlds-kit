const namespace = "https://kit.wazoo.dev/";
const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

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

export function queryBindings<T = Record<string, unknown>>(
  result: unknown,
): T[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as T[];
  if (typeof result !== "object") return [];
  const { results, bindings } = result as {
    results?: unknown;
    bindings?: unknown;
  };
  if (
    typeof results === "object" &&
    results !== null &&
    Array.isArray((results as { bindings?: unknown }).bindings)
  )
    return (results as { bindings: T[] }).bindings;
  if (Array.isArray(results)) return results as T[];
  if (Array.isArray(bindings)) return bindings as T[];
  return [];
}

export function bindingValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "value" in value)
    return (value as { value: unknown }).value;
  return value;
}
