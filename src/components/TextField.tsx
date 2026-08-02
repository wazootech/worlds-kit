import { useBoundItem } from "./useBoundItem";

export function TextField({
  itemId,
  datasetId = "lists",
  parentId = "root",
  placeholder = "",
}: {
  itemId: string;
  datasetId?: string;
  parentId?: string;
  placeholder?: string;
}) {
  const { item, update } = useBoundItem(itemId, datasetId, parentId);
  return (
    <input
      value={String(item.value ?? "")}
      placeholder={placeholder}
      onChange={(event) => void update({ value: event.target.value })}
    />
  );
}
