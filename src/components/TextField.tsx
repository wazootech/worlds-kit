import { useParentItem } from "../context";
import { useBoundItem } from "./useBoundItem";

export function TextField({
  itemId,
  datasetId = "lists",
  parentId = "root",
  placeholder = "",
  property = "title",
}: {
  itemId?: string;
  datasetId?: string;
  parentId?: string;
  placeholder?: string;
  property?: "title" | "value";
}) {
  const contextItemId = useParentItem();
  const targetId = itemId ?? contextItemId;
  if (!targetId) return null;

  const { item, update } = useBoundItem(targetId, datasetId, parentId);
  const currentValue = property === "title" ? (item.title ?? "") : String(item.value ?? "");

  return (
    <input
      value={currentValue}
      placeholder={placeholder}
      onChange={(event) =>
        void update(
          property === "title"
            ? { title: event.target.value }
            : { value: event.target.value }
        )
      }
    />
  );
}
