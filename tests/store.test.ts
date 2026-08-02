import assert from "node:assert/strict";
import test from "node:test";
import {
  addDatasetItem,
  subscribeToDataset,
  subscribeToDatasetItem,
  updateDatasetItem,
  updateDatasetOrder,
  updateItem,
} from "../src/store";
import type { WorldsKitDataSource } from "../src/types";

function fakeClient(result: unknown = { bindings: [] }) {
  const queries: string[] = [];
  const mutations: string[] = [];
  const dataSource: WorldsKitDataSource = {
    query: async (sparql) => {
      queries.push(sparql);
      return result;
    },
    mutate: async (update) => {
      mutations.push(update);
      return undefined;
    },
  };
  return { dataSource, queries, mutations };
}

test("queries an ordered RDF dataset and normalizes SPARQL bindings", async () => {
  const { dataSource, queries } = fakeClient({
    bindings: [
      {
        id: { value: "https://kit.wazoo.dev/world/demo/item/task-1" },
        title: { value: "Ship it" },
        completed: { value: "false" },
        orderIndex: { value: "2" },
      },
    ],
  });
  let items = [] as Awaited<ReturnType<typeof Promise.resolve>>[];
  subscribeToDataset(
    dataSource,
    "demo",
    "root",
    "tasks",
    (value) => {
      items = value;
    },
    assert.fail
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(queries[0]!, /ORDER BY COALESCE\(\?orderIndex, 0\)/);
  assert.deepEqual(items, [{ id: "task-1", title: "Ship it", completed: false, orderIndex: 2, value: undefined }]);
});

test("updates only the requested RDF predicates", async () => {
  const { dataSource, mutations } = fakeClient();
  await updateItem(dataSource, "demo", "task-1", { title: "Done", completed: true });
  assert.equal(mutations.length, 1);
  assert.match(mutations[0]!, /DELETE/);
  assert.match(mutations[0]!, /https:\/\/kit.wazoo.dev\/title/);
  assert.match(mutations[0]!, /https:\/\/kit.wazoo.dev\/completed/);
  assert.doesNotMatch(mutations[0]!, /<[^>]+> \?predicate/);
});

test("creates a new item in the named RDF dataset", async () => {
  const { dataSource, mutations } = fakeClient();
  const result = await addDatasetItem(dataSource, "demo", "root", "tasks", 0);
  assert.match(result.id, /^[0-9a-f-]{36}$/);
  assert.match(mutations[0]!, /INSERT DATA/);
  assert.match(mutations[0]!, /kit.wazoo.dev\/world\/demo\/dataset\/tasks/);
});

test("updateDatasetOrder executes batch orderIndex mutations", async () => {
  const { dataSource, mutations } = fakeClient();
  await updateDatasetOrder(dataSource, "demo", "root", "tasks", ["task-A", "task-B"]);
  assert.equal(mutations.length, 2);
  assert.match(mutations[0]!, /orderIndex/);
  assert.match(mutations[0]!, /"0"\^\^/);
  assert.match(mutations[1]!, /orderIndex/);
  assert.match(mutations[1]!, /"1"\^\^/);
});

test("subscribeToDatasetItem fetches and updates item state", async () => {
  const { dataSource, queries } = fakeClient({
    bindings: [{ id: { value: "https://kit.wazoo.dev/world/demo/item/item-1" }, title: { value: "Item Title" }, completed: { value: "true" } }],
  });
  let itemResult: unknown = null;
  subscribeToDatasetItem(
    dataSource,
    "demo",
    "root",
    "tasks",
    "item-1",
    (val) => {
      itemResult = val;
    },
    assert.fail
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(queries.length, 1);
  assert.match(queries[0]!, /dataset\/tasks/);
  assert.deepEqual(itemResult, { id: "item-1", title: "Item Title", completed: true, orderIndex: undefined, value: undefined });
});

test("updateDatasetItem applies property updates with dataset scoping", async () => {
  const { dataSource, mutations } = fakeClient();
  await updateDatasetItem(dataSource, "demo", "root", "lists", "item-1", { value: "Updated Value" });
  assert.equal(mutations.length, 1);
  assert.match(mutations[0]!, /DELETE/);
  assert.match(mutations[0]!, /https:\/\/kit.wazoo.dev\/value/);
});
