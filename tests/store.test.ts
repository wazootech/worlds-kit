import assert from "node:assert/strict";
import test from "node:test";
import { addDatasetItem, subscribeToDataset, updateItem } from "../src/store";
import type { WorldsClient } from "../src/types";

function fakeClient(result: unknown = { bindings: [] }) {
  const queries: string[] = [];
  const mutations: string[] = [];
  const client: WorldsClient = {
    query: async (sparql) => { queries.push(sparql); return result; },
    mutate: async (update) => { mutations.push(update); return undefined; },
  };
  return { client, queries, mutations };
}

test("queries an ordered RDF dataset and normalizes SPARQL bindings", async () => {
  const { client, queries } = fakeClient({ bindings: [{ id: { value: "https://wazoo.dev/worlds-kit/world/demo/item/task-1" }, title: { value: "Ship it" }, completed: { value: "false" }, orderIndex: { value: "2" } }] });
  let items = [] as Awaited<ReturnType<typeof Promise.resolve>>[];
  subscribeToDataset(client, "demo", "root", "tasks", value => { items = value; }, assert.fail);
  await new Promise(resolve => setImmediate(resolve));
  assert.match(queries[0]!, /ORDER BY \?orderIndex/);
  assert.deepEqual(items, [{ id: "task-1", title: "Ship it", completed: false, orderIndex: 2, value: undefined }]);
});

test("updates only the requested RDF predicates", async () => {
  const { client, mutations } = fakeClient();
  await updateItem(client, "demo", "task-1", { title: "Done", completed: true });
  assert.equal(mutations.length, 1);
  assert.match(mutations[0]!, /DELETE/);
  assert.match(mutations[0]!, /https:\/\/wazoo.dev\/worlds-kit\/title/);
  assert.match(mutations[0]!, /https:\/\/wazoo.dev\/worlds-kit\/completed/);
  assert.doesNotMatch(mutations[0]!, /<[^>]+> \?predicate/);
});

test("creates a new item in the named RDF dataset", async () => {
  const { client, mutations } = fakeClient();
  const result = await addDatasetItem(client, "demo", "root", "tasks", 0);
  assert.match(result.id, /^[0-9a-f-]{36}$/);
  assert.match(mutations[0]!, /INSERT DATA/);
  assert.match(mutations[0]!, /worlds-kit\/world\/demo\/dataset\/tasks/);
});
