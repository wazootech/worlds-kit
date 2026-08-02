import type { ItemTemplateProps } from "../types";

export function Todo({ data, onChange }: ItemTemplateProps) {
  if (!data) return null;
  return (
    <div className="todo-row" data-completed={Boolean(data.completed)}>
      <input
        type="checkbox"
        checked={Boolean(data.completed)}
        onChange={(event) => void onChange?.({ completed: event.target.checked })}
      />
      <input
        type="text"
        value={data.title ?? ""}
        onChange={(event) => void onChange?.({ title: event.target.value })}
      />
    </div>
  );
}
