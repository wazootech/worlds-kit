# WorldsKit roadmap

**Status:** Proposed roadmap for the Worlds-backed implementation.

WorldsKit's foundation is the Lab Note 001 interaction model: item-bound components, datasets, sorting, add actions, and implicit `Source`/`Detail` composition. Worlds supplies the RDF-native graph and the shared SPARQL query/update endpoint; when the injected data source supports it, WorldsKit can also consume live result subscriptions. This roadmap extends that narrow compatibility foundation into a complete item-oriented framework without pretending that Alexander Obenauer's later Lab Notes are a formal API specification.

## Roadmap at a glance

| Phase | Theme | Primary outcome |
| --- | --- | --- |
| 0 | Durable item graph | Stable items and first-class references on Worlds, with a migration from the demo dataset shape. |
| 1 | Browsing contexts | Resumable workspaces, heterogeneous paths, and explicit versus inferred associations. |
| 2 | View composition | Multiple reusable renderers for the same item, independent of data services. |
| 3 | Graph navigation | Backlinks, topics, cross-references, transclusion, and explainable SPARQL traversals. |
| 4 | Actions and services | Capability-scoped actions, item drives, notifications, and automations. |
| 5 | Mutations and recovery | Append-only mutation records, undo, replay, history, and restore. |
| 6 | Time-native interfaces | Dates, timelines, daily summaries, and historical graph views. |
| 7 | Modules and network | Signed modules, feeds, replication, devices, and explicit capability grants. |
| 8 | Fluid interaction | Foldable, contextual, gestural, and semantic-zoom interfaces. |
| 9 | Production hardening | Worlds authorization, schema validation, offline/concurrency behavior, testing, accessibility, and performance. |

## Phase 0 — Durable item graph

The current adapter uses ordered dataset membership and parent predicates to recreate the demonstrated list/detail behavior. It should evolve toward stable item records and first-class references without making containment the only relationship.

- Define stable item types, attributes, lifecycle state, timestamps, and provenance predicates.
- Define `Reference` records with source, target, relation, order, and presentation metadata.
- Add repository functions for create, read, update, archive, restore, reference, unreference, and SPARQL query.
- Keep `Dataset` and `DatasetSortable` working through a compatibility adapter.
- Define Worlds schemas/shapes and authorization boundaries before multi-user writes.

**Exit:** one task can be referenced by a list, date, project, and note; removing a reference does not delete the task; emulator or test-world coverage protects the invariants.

## Phase 1 — Browsing contexts and recent paths

- Add `Workspace`, `WorkspaceEntry`, `BrowsingPath`, and `RecentPaths` item types.
- Persist heterogeneous columns, ordering, resizing, pinning, copying, moving, and reopening.
- Separate explicit graph references from weak contextual associations and explain every inferred result.

## Phase 2 — View composition and atomization

- Define serializable `ViewDefinition` records with supported types, size modes, and capabilities.
- Add `View`, `ViewSwitcher`, `ReferenceList`, `Outline`, `Board`, `Canvas`, `Table`, and `UnifiedDataset` components.
- Ensure renderers consume query results and do not own storage, syncing, or service credentials.

## Phase 3 — User-created views and graph navigation

- Represent view definitions as inspectable Worlds items.
- Add constrained JSON view specs, `ViewComposer`, `ReferencesBox`, topics, tags, cross-reference views, references clouds, and transclusion.
- Return traversal paths with graph-derived results so users can inspect why a result appeared.

## Phase 4 — Actions, services, automations, and notifications

- Define capability-scoped `Service`, `ItemDrive`, `ActionDefinition`, `TriggerDefinition`, and `Automation` records.
- Add an action registry, command palette, action menu, and action button.
- Add retries, idempotency keys, run history, explicit authorization, and separate record-versus-interrupt notification behavior.

## Phase 5 — Mutations, undo, and recovery

- Record create, update, reference, unreference, archive, restore, and action-result mutations as append-only Worlds data.
- Add deterministic replay, snapshots, `ChangeLog`, `HistoryScrubber`, `DiffView`, inverse actions, tombstones, conflict detection, and point-in-time restore.

## Phase 6 — Time-native interfaces

- Add dates, spans, timestamped events, calendars, daily summaries, aligned timelines, historical activity, timezone/locale/precision metadata, and point-in-time graph queries.

## Phase 7 — Published modules and personal computing network

- Define versioned manifests for items, views, actions, automations, dependencies, and permissions.
- Add signed read-only export/import first, then feeds, mutation deltas, device capabilities, local-first replication, encryption, backup, and revocation.

## Phase 8 — Fluid interaction

- Prototype foldable views, recursive workspaces, contextual live items, semantic zoom, spatial canvases, and gesture-driven view construction only after the graph, view, action, and mutation contracts are stable.
- Provide keyboard and screen-reader equivalents for every gestural interaction.

## Phase 9 — Production hardening

- Test Worlds queries, updates, authorization, schema validation, ordering, mutation replay, idempotency, references, offline behavior, concurrency, accessibility, performance, and stable serialization.
- Document safe local demos separately from production deployment requirements.

## Recommended implementation order

1. Stabilize the Worlds item/reference model and compatibility dataset adapter.
2. Add browsing contexts and view/service separation.
3. Add graph navigation and user-authored view specs.
4. Land mutations and recovery before broad external writes.
5. Build actions, services, automations, notifications, and time-native views.
6. Add signed modules and device synchronization.
7. Explore fluid interaction after the contracts are stable.
8. Harden continuously at every write and external-behavior boundary.

## Deliberate non-goals

- Reproducing undisclosed original source code.
- Treating every Lab Note concept as a required package feature.
- Hiding graph-derived behavior behind unexplained magic.
- Publishing remote-write modules or controlling devices before authorization, audit, and revocation are complete.

## Formal references

The roadmap draws conceptual direction from Alexander Obenauer's later Lab Notes: [002](https://alexanderobenauer.com/labnotes/002/), [003](https://alexanderobenauer.com/labnotes/003/), [004](https://alexanderobenauer.com/labnotes/004/), [005](https://alexanderobenauer.com/labnotes/005/), [006](https://alexanderobenauer.com/labnotes/006/), [007](https://alexanderobenauer.com/labnotes/007/), [008](https://alexanderobenauer.com/labnotes/008/), [009](https://alexanderobenauer.com/labnotes/009/), [010](https://alexanderobenauer.com/labnotes/010/), [012](https://alexanderobenauer.com/labnotes/012/), [014](https://alexanderobenauer.com/labnotes/014/), [015](https://alexanderobenauer.com/labnotes/015/), [016](https://alexanderobenauer.com/labnotes/016/), [017](https://alexanderobenauer.com/labnotes/017/), [018](https://alexanderobenauer.com/labnotes/018/), [019](https://alexanderobenauer.com/labnotes/019/), [020](https://alexanderobenauer.com/labnotes/020/), [021](https://alexanderobenauer.com/labnotes/021/), [022](https://alexanderobenauer.com/labnotes/022/), [023](https://alexanderobenauer.com/labnotes/023/), [024](https://alexanderobenauer.com/labnotes/024/), [025](https://alexanderobenauer.com/labnotes/025/), [026](https://alexanderobenauer.com/labnotes/026/), [027](https://alexanderobenauer.com/labnotes/027/), [028](https://alexanderobenauer.com/labnotes/028/), [029](https://alexanderobenauer.com/labnotes/029/), [030](https://alexanderobenauer.com/labnotes/030/), [031](https://alexanderobenauer.com/labnotes/031/), [032](https://alexanderobenauer.com/labnotes/032/), [033](https://alexanderobenauer.com/labnotes/033/), [034](https://alexanderobenauer.com/labnotes/034/), [037](https://alexanderobenauer.com/labnotes/037/), [038](https://alexanderobenauer.com/labnotes/038/), [039](https://alexanderobenauer.com/labnotes/039/), [040](https://alexanderobenauer.com/labnotes/040/), and [041](https://alexanderobenauer.com/labnotes/041/).
