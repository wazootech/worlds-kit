# WorldsKit

A React composition library for building item-oriented interfaces on top of [Worlds](https://wazoo.dev/worlds). WorldsKit keeps the interaction model demonstrated in Alexander Obenauer's Lab Note 001—implicit item binding, datasets, sortable datasets, add actions, and `Source`/`Detail` composition—while using Worlds as the RDF-native persistence and query layer.

> WorldsKit is an independent reimplementation inspired by the ideas and interaction demonstrated in [Lab Note 001: “Composing application interfaces”](https://alexanderobenauer.com/labnotes/001/). It is not Alexander Obenauer's original framework and does not claim source-level equivalence. The original demonstration video is [available on YouTube](https://www.youtube.com/watch?v=PkFBGKkUBD4).

## What is implemented

- `WorldsKitApp`: provides a Worlds client, world ID, and implicit selection context.
- `Dataset`: queries an ordered RDF collection and renders each result through a supplied React template.
- `DatasetSortable`: adds drag-and-drop ordering and persists the resulting order as RDF mutations.
- `Source` and `Detail`: provide master-detail composition without manually threading selected IDs through the tree.
- `TextField`, `Checkbox`, and `Title`: item-bound primitives backed by SPARQL query/mutation operations.
- `Todo` and `SimpleRow`: small templates used by the reference demo.
- `createWorldsClient`: a minimal HTTP client for Worlds query and update endpoints. Inject a richer Worlds client when you need subscriptions or application-specific transport.

## Quick start

```tsx
import { createWorldsClient, DatasetSortable, Detail, SimpleRow, Source, Title, Todo, WorldsKitApp } from "@wazootech/worlds-kit";

const client = createWorldsClient("https://your-worlds-endpoint.example");

export default function App() {
  return (
    <WorldsKitApp worldId="my-world" client={client}>
      <Source>
        <DatasetSortable itemId="lists" template={<SimpleRow editable />} addButton={<button>Add a list</button>} />
      </Source>
      <Detail>
        <Title />
        <DatasetSortable template={<Todo />} addButton={<button>Add a todo...</button>} />
      </Detail>
    </WorldsKitApp>
  );
}
```

The adapter uses RDF identifiers and predicates under the `https://wazoo.dev/worlds-kit/` namespace. The list/detail demo models list records as members of the `lists` dataset under `root`; todo records use the selected list item as their parent. The exact Worlds endpoint and authentication mechanism are intentionally injected through `WorldsClient` so the UI library does not own deployment or credentials.

## Demo

```sh
cd demo
npm install
npm run dev
```

The demo expects a Worlds-compatible HTTP endpoint in `VITE_WORLDS_ENDPOINT` and an optional `VITE_WORLDS_TOKEN`. It is deliberately a small composition example, not a hosted production app.

## Worlds adapter contract

`WorldsClient` has three operations:

```ts
export type WorldsClient = {
  query: <T = unknown>(sparql: string, options?: { signal?: AbortSignal }) => Promise<T>;
  mutate: <T = unknown>(update: string, options?: { signal?: AbortSignal }) => Promise<T>;
  subscribe?: <T = unknown>(sparql: string, onData: (data: T) => void, onError: (error: Error) => void) => () => void;
};
```

`subscribe` is optional. Without it, WorldsKit performs an initial query; with it, datasets and bound items can receive live result updates. This keeps the React library independent of a particular Worlds transport while making SPARQL the durable source of truth.

## Scope and limitations

This first Worlds-backed implementation mirrors the demonstrated interaction model, not undisclosed internals. It does not yet provide authentication, authorization policy, schema validation, deletion UI, offline conflict resolution, mutation history, or a public package release workflow. Production applications must supply a properly scoped Worlds client and enforce authorization in the Worlds service.

The later item graph, references, views, actions, services, mutations, modules, and fluid interaction roadmap remains intentionally separate from this compatibility foundation. See `ROADMAP.md` for the proposed next steps and the corresponding Lab Note references.

## Sources

- Alexander Obenauer, [LN 001: Composing application interfaces](https://alexanderobenauer.com/labnotes/001/), January 10, 2021.
- [Worlds documentation](https://docs.wazoo.dev/llms-full.txt).
- [Worlds TypeScript SDK documentation](https://docs.wazoo.dev/platform/typescript-sdk).
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/).
- [SPARQL 1.1 Update](https://www.w3.org/TR/sparql11-update/).
