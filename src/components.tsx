import { cloneElement, useEffect, useState, type ReactElement, type ReactNode } from "react";
import { ItemProvider, useParentItem, useWorldsKit } from "./context";
import { addDatasetItem, subscribeToDataset, subscribeToDatasetItem, updateDatasetItem, updateDatasetOrder } from "./store";
import type { DatasetProps, ItemTemplateProps, ItemUpdates, WorldsKitItem } from "./types";

function useItems(datasetId: string, parentId: string | null) {
  const { worldId, dataSource } = useWorldsKit();
  const resolvedParentId = parentId ?? "root";
  const [items, setItems] = useState<WorldsKitItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    setError(null);
    return subscribeToDataset(dataSource, worldId, resolvedParentId, datasetId, setItems, setError);
  }, [dataSource, datasetId, resolvedParentId, worldId]);
  return { items, error };
}

function DatasetView({ template, addButton, itemId = "default", isSource, onSelect, selectedId, sortable = false, className = "", emptyState = null }: DatasetProps & { sortable?: boolean }) {
  const parentId = useParentItem();
  const { worldId, dataSource } = useWorldsKit();
  const { items, error } = useItems(itemId, parentId);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const add = async () => { await addDatasetItem(dataSource, worldId, parentId ?? "root", itemId, items.length); };
  const update = async (id: string, updates: ItemUpdates) => { await updateDatasetItem(dataSource, worldId, parentId ?? "root", itemId, id, updates); };
  const reorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIndex = items.findIndex(item => item.id === fromId);
    const toIndex = items.findIndex(item => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    await updateDatasetOrder(dataSource, worldId, parentId ?? "root", itemId, next.map(item => item.id));
  };
  if (error) return <div role="alert">Unable to load this dataset: {error.message}</div>;
  return <div className={`worlds-kit-dataset ${className}`}>
    <div className="worlds-kit-dataset-items">
      {items.length === 0 && emptyState}
      {items.map(item => <div key={item.id} className="worlds-kit-item" data-selected={selectedId === item.id} draggable={sortable} onDragStart={() => setDraggedId(item.id)} onDragOver={event => sortable && event.preventDefault()} onDrop={() => draggedId && void reorder(draggedId, item.id)} onClick={() => isSource && onSelect?.(item.id)}>
        {cloneElement(template, { data: item, onChange: updates => void update(item.id, updates) })}
      </div>)}
    </div>
    {addButton && cloneElement(addButton, { onClick: add })}
  </div>;
}

export function Dataset(props: DatasetProps) { return <DatasetView {...props} />; }
export function DatasetSortable(props: DatasetProps) { return <DatasetView {...props} sortable />; }
export function Source({ children }: { children: ReactElement<DatasetProps> }) { const { activeSourceId, setActiveSourceId } = useWorldsKit(); return cloneElement(children, { isSource: true, selectedId: activeSourceId, onSelect: setActiveSourceId }); }
export function Detail({ children }: { children: ReactNode }) { const { activeSourceId } = useWorldsKit(); if (!activeSourceId) return <div className="worlds-kit-empty-state">Select an item...</div>; return <ItemProvider value={activeSourceId}>{children}</ItemProvider>; }

function useBoundItem(itemId: string, datasetId: string, parentId: string) {
  const { dataSource, worldId } = useWorldsKit();
  const [item, setItem] = useState<WorldsKitItem>({ id: itemId });
  useEffect(() => subscribeToDatasetItem(dataSource, worldId, parentId, datasetId, itemId, value => value && setItem(value), () => {}), [dataSource, datasetId, itemId, parentId, worldId]);
  return { item, update: (updates: ItemUpdates) => updateDatasetItem(dataSource, worldId, parentId, datasetId, itemId, updates) };
}

export function TextField({ itemId, datasetId = "lists", parentId = "root", placeholder = "" }: { itemId: string; datasetId?: string; parentId?: string; placeholder?: string }) { const { item, update } = useBoundItem(itemId, datasetId, parentId); return <input value={String(item.value ?? "")} placeholder={placeholder} onChange={event => void update({ value: event.target.value })} />; }
export function Checkbox({ itemId, datasetId = "lists", parentId = "root" }: { itemId: string; datasetId?: string; parentId?: string }) { const { item, update } = useBoundItem(itemId, datasetId, parentId); return <input type="checkbox" checked={Boolean(item.value)} onChange={event => void update({ value: event.target.checked })} />; }
export function Title() { const id = useParentItem(); if (!id) return null; const { item } = useBoundItem(id, "lists", "root"); return <h1>{item.title ?? ""}</h1>; }
export function Todo({ data, onChange }: ItemTemplateProps) { if (!data) return null; return <div className="todo-row" data-completed={Boolean(data.completed)}><input type="checkbox" checked={Boolean(data.completed)} onChange={event => void onChange?.({ completed: event.target.checked })} /><input type="text" value={data.title ?? ""} onChange={event => void onChange?.({ title: event.target.value })} /></div>; }
export function SimpleRow({ data, onChange, editable = false }: ItemTemplateProps & { editable?: boolean }) { if (!data) return null; return <div className="simple-row">{editable ? <input value={data.title ?? ""} onChange={event => void onChange?.({ title: event.target.value })} /> : <span>{data.title ?? ""}</span>}</div>; }
