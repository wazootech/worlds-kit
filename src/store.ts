import type { WorldsKitDataSource, WorldsKitItem, ItemUpdates, WorldsKitQueryResult, WorldsKitSubscription } from "./types";
import { bindingValue, datasetIri, encodeIri, itemIri, literal, predicateIri, queryBindings, sparqlValue } from "./worlds";

function itemQuery(worldId: string, parentId: string, datasetId: string) {
  const parent = encodeIri(itemIri(worldId, parentId));
  const dataset = encodeIri(datasetIri(worldId, datasetId));
  return `SELECT ?id ?title ?completed ?orderIndex ?value WHERE { ?id <${predicateIri("inDataset")}> ${dataset} ; <${predicateIri("parent")}> ${parent} . OPTIONAL { ?id <${predicateIri("title")}> ?title } OPTIONAL { ?id <${predicateIri("completed")}> ?completed } OPTIONAL { ?id <${predicateIri("orderIndex")}> ?orderIndex } OPTIONAL { ?id <${predicateIri("value")}> ?value } } ORDER BY COALESCE(?orderIndex, 0)`;
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

export function subscribeToDataset(dataSource: WorldsKitDataSource, worldId: string, parentId: string, datasetId: string, onItems: (items: WorldsKitItem[]) => void, onError: (error: Error) => void): WorldsKitSubscription {
  const sparql = itemQuery(worldId, parentId, datasetId);
  const processResult = (result: WorldsKitQueryResult<Record<string, unknown>>) => {
    const items = queryBindings(result).map(row => normalizeItem(row, worldId));
    items.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    onItems(items);
  };
  if (dataSource.subscribe) return dataSource.subscribe<WorldsKitQueryResult<Record<string, unknown>>>(sparql, processResult, onError, { worldId });
  let active = true;
  const controller = new AbortController();
  void dataSource.query<WorldsKitQueryResult<Record<string, unknown>>>(sparql, { worldId, signal: controller.signal }).then(result => { if (active) processResult(result); }).catch(error => { if (active && error.name !== "AbortError") onError(error); });
  return () => { active = false; controller.abort(); };
}

export function addDatasetItem(dataSource: WorldsKitDataSource, worldId: string, parentId: string, datasetId: string, orderIndex: number) {
  const id = crypto.randomUUID();
  const subject = encodeIri(itemIri(worldId, id));
  const parent = encodeIri(itemIri(worldId, parentId));
  const dataset = encodeIri(datasetIri(worldId, datasetId));
  const insert = `INSERT DATA { ${subject} <${predicateIri("inDataset")}> ${dataset} ; <${predicateIri("parent")}> ${parent} ; <${predicateIri("title")}> \"\" ; <${predicateIri("completed")}> ${literal(false)} ; <${predicateIri("orderIndex")}> ${literal(orderIndex)} ; <${predicateIri("createdAt")}> ${literal(new Date())} }`;
  return dataSource.mutate(insert, { worldId }).then(() => ({ id }));
}

export function updateDatasetItem(dataSource: WorldsKitDataSource, worldId: string, _parentId: string, _datasetId: string, id: string, updates: ItemUpdates) { return updateItem(dataSource, worldId, id, updates); }

export function updateItem(dataSource: WorldsKitDataSource, worldId: string, id: string, updates: ItemUpdates) {
  const subject = encodeIri(itemIri(worldId, id));
  const entries = Object.entries(updates);
  if (entries.length === 0) return Promise.resolve(undefined);
  const deletePatterns = entries.map(([key], index) => `${subject} <${predicateIri(key)}> ?old${index} .`).join(" ");
  const insertPatterns = entries.map(([key, value]) => `${subject} <${predicateIri(key)}> ${sparqlValue(value)} .`).join(" ");
  const optionalPatterns = entries.map(([key], index) => `OPTIONAL { ${subject} <${predicateIri(key)}> ?old${index} }`).join(" ");
  return dataSource.mutate(`DELETE { ${deletePatterns} } INSERT { ${insertPatterns} } WHERE { ${optionalPatterns} }`, { worldId });
}

export function updateDatasetOrder(dataSource: WorldsKitDataSource, worldId: string, _parentId: string, _datasetId: string, ids: string[]) { return Promise.all(ids.map((id, index) => updateItem(dataSource, worldId, id, { orderIndex: index }))); }

export function subscribeToValue<T>(dataSource: WorldsKitDataSource, worldId: string, itemId: string, onValue: (value: T) => void, onError: (error: Error) => void): WorldsKitSubscription {
  const sparql = `SELECT ?value WHERE { ${encodeIri(itemIri(worldId, itemId))} <${predicateIri("value")}> ?value }`;
  if (dataSource.subscribe) return dataSource.subscribe<WorldsKitQueryResult<Record<string, unknown>>>(sparql, result => onValue((bindingValue(queryBindings(result)[0]?.value) ?? "") as T), onError, { worldId });
  let active = true;
  const controller = new AbortController();
  void dataSource.query<WorldsKitQueryResult<Record<string, unknown>>>(sparql, { worldId, signal: controller.signal }).then(result => { if (active) onValue((bindingValue(queryBindings(result)[0]?.value) ?? "") as T); }).catch(error => { if (active && error.name !== "AbortError") onError(error); });
  return () => { active = false; controller.abort(); };
}

export function saveValue(dataSource: WorldsKitDataSource, worldId: string, itemId: string, value: unknown) { return updateItem(dataSource, worldId, itemId, { value }); }

export function subscribeToDatasetItem(dataSource: WorldsKitDataSource, worldId: string, parentId: string, datasetId: string, id: string, onItem: (item: WorldsKitItem | null) => void, onError: (error: Error) => void): WorldsKitSubscription {
  return subscribeToDataset(dataSource, worldId, parentId, datasetId, items => onItem(items.find(item => item.id === id) ?? null), onError);
}
