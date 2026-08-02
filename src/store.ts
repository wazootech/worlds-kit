import type { WorldsClient, WorldsKitItem, ItemUpdates, WorldsQueryResult, WorldsSubscription } from "./types";
import { bindingValue, datasetIri, encodeIri, itemIri, literal, predicateIri, queryBindings, sparqlValue } from "./worlds";

function itemQuery(worldId: string, parentId: string, datasetId: string) {
  const parent = encodeIri(itemIri(worldId, parentId));
  const dataset = encodeIri(datasetIri(worldId, datasetId));
  return `SELECT ?id ?title ?completed ?orderIndex ?value WHERE { ?id <${predicateIri("inDataset")}> ${dataset} ; <${predicateIri("parent")}> ${parent} . OPTIONAL { ?id <${predicateIri("title")}> ?title } OPTIONAL { ?id <${predicateIri("completed")}> ?completed } OPTIONAL { ?id <${predicateIri("orderIndex")}> ?orderIndex } OPTIONAL { ?id <${predicateIri("value")}> ?value } } ORDER BY ?orderIndex`;
}

function normalizeTerm(value: unknown) { return String(bindingValue(value) ?? ""); }

function itemIdFromIri(value: unknown, worldId: string) {
  const rawId = normalizeTerm(value).replace(/^<|>$/g, "");
  const itemMarker = "/item/";
  const markerIndex = rawId.indexOf(itemMarker);
  const id = markerIndex >= 0 ? rawId.slice(markerIndex + itemMarker.length) : rawId.split("/").pop() ?? rawId;
  return decodeURIComponent(id);
}

function normalizeItem(row: Record<string, unknown>, worldId: string): WorldsKitItem {
  const itemId = itemIdFromIri(row.id ?? row.item ?? row.subject, worldId);
  const title = row.title === undefined ? undefined : normalizeTerm(row.title);
  const completed = row.completed === undefined ? undefined : normalizeTerm(row.completed) === "true";
  const orderIndex = row.orderIndex === undefined ? undefined : Number(normalizeTerm(row.orderIndex));
  const value = row.value === undefined ? undefined : bindingValue(row.value);
  return { id: decodeURIComponent(itemId), title, completed, orderIndex, value };
}

export function subscribeToDataset(client: WorldsClient, worldId: string, parentId: string, datasetId: string, onItems: (items: WorldsKitItem[]) => void, onError: (error: Error) => void): WorldsSubscription {
  const sparql = itemQuery(worldId, parentId, datasetId);
  if (client.subscribe) return client.subscribe<WorldsQueryResult<Record<string, unknown>>>(sparql, result => onItems(queryBindings(result).map(row => normalizeItem(row, worldId))), onError);
  let active = true;
  const controller = new AbortController();
  void client.query<WorldsQueryResult<Record<string, unknown>>>(sparql, { signal: controller.signal }).then(result => { if (active) onItems(queryBindings(result).map(row => normalizeItem(row, worldId))); }).catch(error => { if (active && error.name !== "AbortError") onError(error); });
  return () => { active = false; controller.abort(); };
}

export function addDatasetItem(client: WorldsClient, worldId: string, parentId: string, datasetId: string, orderIndex: number) {
  const id = crypto.randomUUID();
  const subject = encodeIri(itemIri(worldId, id));
  const parent = encodeIri(itemIri(worldId, parentId));
  const dataset = encodeIri(datasetIri(worldId, datasetId));
  const insert = `INSERT DATA { ${subject} <${predicateIri("inDataset")}> ${dataset} ; <${predicateIri("parent")}> ${parent} ; <${predicateIri("title")}> \"\" ; <${predicateIri("completed")}> ${literal(false)} ; <${predicateIri("orderIndex")}> ${literal(orderIndex)} ; <${predicateIri("createdAt")}> ${literal(new Date())} }`;
  return client.mutate(insert).then(() => ({ id }));
}

export function updateDatasetItem(client: WorldsClient, worldId: string, _parentId: string, _datasetId: string, id: string, updates: ItemUpdates) { return updateItem(client, worldId, id, updates); }

export function updateItem(client: WorldsClient, worldId: string, id: string, updates: ItemUpdates) {
  const subject = encodeIri(itemIri(worldId, id));
  const entries = Object.entries(updates);
  if (entries.length === 0) return Promise.resolve(undefined);
  const deletePatterns = entries.map(([key], index) => `${subject} <${predicateIri(key)}> ?old${index} .`).join(" ");
  const insertPatterns = entries.map(([key, value]) => `${subject} <${predicateIri(key)}> ${sparqlValue(value)} .`).join(" ");
  const optionalPatterns = entries.map(([key], index) => `OPTIONAL { ${subject} <${predicateIri(key)}> ?old${index} }`).join(" ");
  return client.mutate(`DELETE { ${deletePatterns} } INSERT { ${insertPatterns} } WHERE { ${optionalPatterns} }`);
}

export function updateDatasetOrder(client: WorldsClient, worldId: string, _parentId: string, _datasetId: string, ids: string[]) { return Promise.all(ids.map((id, index) => updateItem(client, worldId, id, { orderIndex: index }))); }

export function subscribeToValue<T>(client: WorldsClient, worldId: string, itemId: string, onValue: (value: T) => void, onError: (error: Error) => void): WorldsSubscription {
  const sparql = `SELECT ?value WHERE { ${encodeIri(itemIri(worldId, itemId))} <${predicateIri("value")}> ?value }`;
  if (client.subscribe) return client.subscribe<WorldsQueryResult<Record<string, unknown>>>(sparql, result => onValue((bindingValue(queryBindings(result)[0]?.value) ?? "") as T), onError);
  let active = true;
  const controller = new AbortController();
  void client.query<WorldsQueryResult<Record<string, unknown>>>(sparql, { signal: controller.signal }).then(result => { if (active) onValue((bindingValue(queryBindings(result)[0]?.value) ?? "") as T); }).catch(error => { if (active && error.name !== "AbortError") onError(error); });
  return () => { active = false; controller.abort(); };
}

export function saveValue(client: WorldsClient, worldId: string, itemId: string, value: unknown) { return updateItem(client, worldId, itemId, { value }); }

export function subscribeToDatasetItem(client: WorldsClient, worldId: string, parentId: string, datasetId: string, id: string, onItem: (item: WorldsKitItem | null) => void, onError: (error: Error) => void): WorldsSubscription {
  return subscribeToDataset(client, worldId, parentId, datasetId, items => onItem(items.find(item => item.id === id) ?? null), onError);
}
