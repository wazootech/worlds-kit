import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ItemProvider, WorldsKitApp, useParentItem, useSelectedItem, useWorldsKit } from "../src/context";
import { Checkbox } from "../src/components/Checkbox";
import { SimpleRow } from "../src/components/SimpleRow";
import { TextField } from "../src/components/TextField";
import { Title } from "../src/components/Title";
import { Todo } from "../src/components/Todo";
import type { WorldsKitDataSource } from "../src/types";

const mockDataSource: WorldsKitDataSource = {
  query: async () => ({ results: [] }),
  mutate: async () => undefined,
};

test("useWorldsKit throws error when rendered outside WorldsKitApp context", () => {
  function TestConsumer() {
    useWorldsKit();
    return null;
  }
  assert.throws(() => renderToStaticMarkup(createElement(TestConsumer)), {
    message: "WorldsKit components must be rendered inside WorldsKitApp.",
  });
});

test("ItemProvider passes item ID through context", () => {
  let capturedId: string | null = null;
  function Consumer() {
    capturedId = useParentItem();
    const selected = useSelectedItem();
    assert.equal(selected, capturedId);
    return createElement("div", null, capturedId);
  }

  const html = renderToStaticMarkup(
    createElement(
      WorldsKitApp,
      { worldId: "test-world", dataSource: mockDataSource },
      createElement(ItemProvider, { value: "item-xyz" }, createElement(Consumer))
    )
  );

  assert.equal(capturedId, "item-xyz");
  assert.match(html, /item-xyz/);
});

test("SimpleRow renders static and editable title markup", () => {
  const staticHtml = renderToStaticMarkup(
    createElement(SimpleRow, { data: { id: "item-1", title: "My Task" } })
  );
  assert.match(staticHtml, /<span[^>]*>My Task<\/span>/);

  const editableHtml = renderToStaticMarkup(
    createElement(SimpleRow, { data: { id: "item-1", title: "My Task" }, editable: true })
  );
  assert.match(editableHtml, /<input[^>]*value="My Task"[^>]*\/>/);
});

test("Todo component composes Checkbox and TextField inside ItemProvider", () => {
  const html = renderToStaticMarkup(
    createElement(
      WorldsKitApp,
      { worldId: "test-world", dataSource: mockDataSource },
      createElement(Todo, { data: { id: "item-todo-1", title: "Buy Milk", completed: true } })
    )
  );

  assert.match(html, /class="todo-row"/);
  assert.match(html, /data-completed="true"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /<input[^>]*placeholder=""/);
});
