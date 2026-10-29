import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dataset, DatasetSortable, Detail, Source, WorldsKitApp } from "../src";
import type { ItemTemplateProps, WorldsKitDataSource } from "../src/types";

const mockDataSource: WorldsKitDataSource = {
  query: async () => ({ results: [] }),
  mutate: async () => undefined,
};

function Template(_props: ItemTemplateProps) {
  return createElement("div", null, "Template");
}

function renderInApp(children: ReactNode) {
  return renderToStaticMarkup(
    createElement(WorldsKitApp, {
      worldId: "demo-world",
      dataSource: mockDataSource,
      children,
    }),
  );
}

test("Dataset renders empty state when items list is empty", () => {
  const html = renderInApp(
    createElement(Dataset, {
      itemId: "lists",
      template: createElement(Template),
      emptyState: createElement("p", { className: "empty" }, "No items found"),
    }),
  );

  assert.match(html, /class="worlds-kit-dataset/);
  assert.match(html, /No items found/);
});

test("DatasetSortable applies draggable attribute", () => {
  const html = renderInApp(
    createElement(DatasetSortable, {
      itemId: "lists",
      template: createElement(Template),
    }),
  );

  assert.match(html, /class="worlds-kit-dataset/);
});

test("Detail renders placeholder message when no item is selected", () => {
  const html = renderInApp(
    createElement(Detail, {
      children: createElement("div", null, "Detail Content"),
    }),
  );

  assert.match(html, /Select an item\.\.\./);
  assert.doesNotMatch(html, /Detail Content/);
});

test("Source wraps children with selection handlers", () => {
  const html = renderInApp(
    createElement(Source, {
      children: createElement(Dataset, {
        itemId: "lists",
        template: createElement(Template),
      }),
    }),
  );

  assert.match(html, /worlds-kit-dataset/);
});
