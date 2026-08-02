import { cloneElement, useState } from "react";
import { useParentItem, useWorldsKit } from "../context";
import { addDatasetItem, updateDatasetItem, updateDatasetOrder } from "../store";
import type { DatasetProps, ItemUpdates } from "../types";
import { useItems } from "./useItems";

function DatasetView({
  template,
  addButton,
  itemId = "default",
  isSource,
  onSelect,
  selectedId,
  sortable = false,
  className = "",
  emptyState = null,
}: DatasetProps & { sortable?: boolean }) {
  const parentId = useParentItem();
  const { worldId, dataSource } = useWorldsKit();
  const { items, error } = useItems(itemId, parentId);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const add = async () => {
    await addDatasetItem(dataSource, worldId, parentId ?? "root", itemId, items.length);
  };

  const update = async (id: string, updates: ItemUpdates) => {
    await updateDatasetItem(dataSource, worldId, parentId ?? "root", itemId, id, updates);
  };

  const reorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIndex = items.findIndex((item) => item.id === fromId);
    const toIndex = items.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    await updateDatasetOrder(
      dataSource,
      worldId,
      parentId ?? "root",
      itemId,
      next.map((item) => item.id)
    );
  };

  if (error) {
    return <div role="alert">Unable to load this dataset: {error.message}</div>;
  }

  return (
    <div className={`worlds-kit-dataset ${className}`}>
      <div className="worlds-kit-dataset-items">
        {items.length === 0 && emptyState}
        {items.map((item) => (
          <div
            key={item.id}
            className="worlds-kit-item"
            data-selected={selectedId === item.id}
            draggable={sortable}
            onDragStart={() => setDraggedId(item.id)}
            onDragOver={(event) => sortable && event.preventDefault()}
            onDrop={() => draggedId && void reorder(draggedId, item.id)}
            onClick={() => isSource && onSelect?.(item.id)}
          >
            {cloneElement(template, {
              data: item,
              onChange: (updates) => void update(item.id, updates),
            })}
          </div>
        ))}
      </div>
      {addButton && cloneElement(addButton, { onClick: add })}
    </div>
  );
}

export function Dataset(props: DatasetProps) {
  return <DatasetView {...props} />;
}

export function DatasetSortable(props: DatasetProps) {
  return <DatasetView {...props} sortable />;
}
