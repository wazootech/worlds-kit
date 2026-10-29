import type { WorldsKitItem } from "./types";
import {
  bindingValue,
  datasetIri,
  encodeIri,
  itemIri,
  predicateIri,
} from "./worlds";

export function itemQuery(
  worldId: string,
  parentId: string,
  datasetId: string,
) {
  const parent = encodeIri(itemIri(worldId, parentId));
  const dataset = encodeIri(datasetIri(worldId, datasetId));
  return `SELECT ?id ?title ?completed ?orderIndex ?value WHERE { ?id <${predicateIri("inDataset")}> ${dataset} ; <${predicateIri("parent")}> ${parent} . OPTIONAL { ?id <${predicateIri("title")}> ?title } OPTIONAL { ?id <${predicateIri("completed")}> ?completed } OPTIONAL { ?id <${predicateIri("orderIndex")}> ?orderIndex } OPTIONAL { ?id <${predicateIri("value")}> ?value } } ORDER BY COALESCE(?orderIndex, 0)`;
}

function normalizeTerm(value: unknown) {
  return String(bindingValue(value) ?? "");
}

function itemIdFromIri(value: unknown, _worldId: string) {
  const rawId = normalizeTerm(value).replace(/^<|>$/g, "");
  const itemMarker = "/item/";
  const markerIndex = rawId.indexOf(itemMarker);
  const id =
    markerIndex >= 0
      ? rawId.slice(markerIndex + itemMarker.length)
      : (rawId.split("/").pop() ?? rawId);
  return decodeURIComponent(id);
}

export function normalizeItem(
  row: Record<string, unknown>,
  worldId: string,
): WorldsKitItem {
  const itemId = itemIdFromIri(row.id ?? row.item ?? row.subject, worldId);
  const title = row.title === undefined ? undefined : normalizeTerm(row.title);
  const completed =
    row.completed === undefined
      ? undefined
      : normalizeTerm(row.completed) === "true";
  const orderIndex =
    row.orderIndex === undefined
      ? undefined
      : Number(normalizeTerm(row.orderIndex));
  const value = row.value === undefined ? undefined : bindingValue(row.value);
  return {
    id: decodeURIComponent(itemId),
    title,
    completed,
    orderIndex,
    value,
  };
}
