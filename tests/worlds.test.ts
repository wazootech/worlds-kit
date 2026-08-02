import assert from "node:assert/strict";
import test from "node:test";
import {
  bindingValue,
  createWorldsKitDataSource,
  datasetIri,
  encodeIri,
  itemIri,
  literal,
  predicateIri,
  queryBindings,
} from "../src/worlds";

test("encodeIri wraps IRIs in angle brackets", () => {
  assert.equal(encodeIri("https://example.com/foo"), "<https://example.com/foo>");
  assert.equal(encodeIri("<https://example.com/foo>"), "<https://example.com/foo>");
});

test("datasetIri and itemIri format correct IRIs", () => {
  assert.equal(datasetIri("my-world", "my-dataset"), "https://kit.wazoo.dev/world/my-world/dataset/my-dataset");
  assert.equal(itemIri("my-world", "item-1"), "https://kit.wazoo.dev/world/my-world/item/item-1");
  assert.equal(predicateIri("title"), "https://kit.wazoo.dev/title");
});

test("literal formats strings, numbers, and booleans with XSD types", () => {
  assert.equal(literal("hello"), '"hello"');
  assert.equal(literal(true), '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>');
  assert.equal(literal(false), '"false"^^<http://www.w3.org/2001/XMLSchema#boolean>');
  assert.equal(literal(42), '"42"^^<http://www.w3.org/2001/XMLSchema#integer>');
  assert.equal(literal(null), '""');
});

test("bindingValue extracts raw values from RDF term objects and strings", () => {
  assert.equal(bindingValue({ value: "test" }), "test");
  assert.equal(bindingValue("direct-string"), "direct-string");
  assert.equal(bindingValue(null), null);
});

test("queryBindings safely unwraps W3C SPARQL JSON and plain array formats", () => {
  assert.deepEqual(queryBindings(null), []);
  assert.deepEqual(queryBindings([{ id: "1" }]), [{ id: "1" }]);
  assert.deepEqual(queryBindings({ results: { bindings: [{ id: "2" }] } }), [{ id: "2" }]);
  assert.deepEqual(queryBindings({ results: [{ id: "3" }] }), [{ id: "3" }]);
  assert.deepEqual(queryBindings({ bindings: [{ id: "4" }] }), [{ id: "4" }]);
});

test("createWorldsKitDataSource resolves dynamic worldId endpoint URLs", async () => {
  let requestedUrl = "";
  let requestHeaders: Record<string, string> = {};

  const globalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requestedUrl = String(url);
    requestHeaders = (init?.headers ?? {}) as Record<string, string>;
    return new Response(JSON.stringify({ head: {}, results: { bindings: [] } }));
  }) as typeof globalThis.fetch;

  try {
    const ds = createWorldsKitDataSource("https://worlds-api.wazoo.dev", "my-token");
    await ds.query("SELECT * WHERE { ?s ?p ?o }", { worldId: "test-world" });

    assert.equal(requestedUrl, "https://worlds-api.wazoo.dev/worlds/test-world/sparql");
    assert.equal(requestHeaders.Authorization, "Bearer my-token");
    assert.equal(requestHeaders["Content-Type"], "application/json");
  } finally {
    globalThis.fetch = globalFetch;
  }
});
