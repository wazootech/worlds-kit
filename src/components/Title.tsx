import { useParentItem } from "../context";
import { useBoundItem } from "./useBoundItem";

export function Title() {
  const id = useParentItem();
  if (!id) return null;
  const { item } = useBoundItem(id, "lists", "root");
  return <h1>{item.title ?? ""}</h1>;
}
