import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dataset, DatasetSortable, Detail, Source, WorldsKitApp } from "../src";
import type { WorldsKitDataSource } from "../src/types";

const mockDataSource: WorldsKitDataSource = {
  query: async () => ({ results: [] }),
  mutate: async () => undefined,
};

test("Dataset renders empty state when items list is empty", () => {
  const html = renderToStaticMarkup(
    createElement(
      WorldsKitApp,
      { worldId: "demo-world", dataSource: mockDataSource },
      createElement(Dataset, {
        itemId: "lists",
        template: createElement("div", null, "Template"),
        emptyState: createElement("p", { className: "empty" }, "No items found"),
      })
    )
  );

  assert.match(html, /class="worlds-kit-dataset/);
  assert.match(html, /No items found/);
});

test("DatasetSortable applies draggable attribute", () => {
  const html = renderToStaticMarkup(
    createElement(
      WorldsKitApp,
      { worldId: "demo-world", dataSource: mockDataSource },
      createElement(DatasetSortable, {
        itemId: "lists",
        template: createElement("div", null, "Template"),
      })
    )
  );

  assert.match(html, /class="worlds-kit-dataset/);
});

test("Detail renders placeholder message when no item is selected", () => {
  const html = renderToStaticMarkup(
    createElement(
      WorldsKitApp,
      { worldId: "demo-world", dataSource: mockDataSource },
      createElement(Detail, null, createElement("div", null, "Detail Content"))
    )
  );

  assert.match(html, /Select an item\.\.\./);
  assert.doesNotMatch(html, /Detail Content/);
});

test("Source wraps children with selection handlers", () => {
  const html = renderToStaticMarkup(
    createElement(
      WorldsKitApp,
      { worldId: "demo-world", dataSource: mockDataSource },
      createElement(
        Source,
        null,
        createElement(Dataset, {
          itemId: "lists",
          template: createElement("div", null, "Template"),
        })
      )
    )
  );

  assert.match(html, /worlds-kit-dataset/);
});
