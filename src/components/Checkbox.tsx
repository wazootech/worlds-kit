import { useBoundItem } from "./useBoundItem";

export function Checkbox({
  itemId,
  datasetId = "lists",
  parentId = "root",
}: {
  itemId: string;
  datasetId?: string;
  parentId?: string;
}) {
  const { item, update } = useBoundItem(itemId, datasetId, parentId);
  return (
    <input
      type="checkbox"
      checked={Boolean(item.value)}
      onChange={(event) => void update({ value: event.target.checked })}
    />
  );
}
