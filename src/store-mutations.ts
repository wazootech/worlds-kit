import type { WorldsKitDataSource, ItemUpdates } from "./types";
import {
  datasetIri,
  encodeIri,
  itemIri,
  literal,
  predicateIri,
  sparqlValue,
} from "./worlds";

export function addDatasetItem(
  dataSource: WorldsKitDataSource,
  worldId: string,
  parentId: string,
  datasetId: string,
  orderIndex: number,
) {
  const id = crypto.randomUUID();
  const subject = encodeIri(itemIri(worldId, id));
  const parent = encodeIri(itemIri(worldId, parentId));
  const dataset = encodeIri(datasetIri(worldId, datasetId));
  const insert = `INSERT DATA { ${subject} <${predicateIri("inDataset")}> ${dataset} ; <${predicateIri("parent")}> ${parent} ; <${predicateIri("title")}> "" ; <${predicateIri("completed")}> ${literal(false)} ; <${predicateIri("orderIndex")}> ${literal(orderIndex)} ; <${predicateIri("createdAt")}> ${literal(new Date())} }`;
  return dataSource.mutate(insert, { worldId }).then(() => ({ id }));
}

export function updateDatasetItem(
  dataSource: WorldsKitDataSource,
  worldId: string,
  _parentId: string,
  _datasetId: string,
  id: string,
  updates: ItemUpdates,
) {
  return updateItem(dataSource, worldId, id, updates);
}

export function updateItem(
  dataSource: WorldsKitDataSource,
  worldId: string,
  id: string,
  updates: ItemUpdates,
) {
  const subject = encodeIri(itemIri(worldId, id));
  const entries = Object.entries(updates);
  if (entries.length === 0) return Promise.resolve(undefined);
  const deletePatterns = entries
    .map(([key], index) => `${subject} <${predicateIri(key)}> ?old${index} .`)
    .join(" ");
  const insertPatterns = entries
    .map(
      ([key, value]) =>
        `${subject} <${predicateIri(key)}> ${sparqlValue(value)} .`,
    )
    .join(" ");
  const optionalPatterns = entries
    .map(
      ([key], index) =>
        `OPTIONAL { ${subject} <${predicateIri(key)}> ?old${index} }`,
    )
    .join(" ");
  return dataSource.mutate(
    `DELETE { ${deletePatterns} } INSERT { ${insertPatterns} } WHERE { ${optionalPatterns} }`,
    { worldId },
  );
}

export function updateDatasetOrder(
  dataSource: WorldsKitDataSource,
  worldId: string,
  _parentId: string,
  _datasetId: string,
  ids: string[],
) {
  return Promise.all(
    ids.map((id, index) =>
      updateItem(dataSource, worldId, id, { orderIndex: index }),
    ),
  );
}

export function saveValue(
  dataSource: WorldsKitDataSource,
  worldId: string,
  itemId: string,
  value: unknown,
) {
  return updateItem(dataSource, worldId, itemId, { value });
}
