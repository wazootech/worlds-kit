import type { ReactNode } from "react";
import { useParentItem } from "../context";
import { useBoundItem } from "./useBoundItem";

export function Checkbox({
  itemId,
  datasetId = "lists",
  parentId = "root",
}: {
  itemId?: string;
  datasetId?: string;
  parentId?: string;
}): ReactNode {
  const contextItemId = useParentItem();
  const targetId = itemId ?? contextItemId;
  if (!targetId) return null;

  const { item, update } = useBoundItem(targetId, datasetId, parentId);
  const isChecked = Boolean(item.completed ?? item.value);

  return (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={(event) =>
        void update({
          completed: event.target.checked,
          value: event.target.checked,
        })
      }
    />
  );
}
