import { ItemProvider } from "../context";
import type { ItemTemplateProps } from "../types";
import { Checkbox } from "./Checkbox";
import { TextField } from "./TextField";

export function Todo({ data }: ItemTemplateProps) {
  if (!data) return null;
  return (
    <ItemProvider value={data.id}>
      <div className="todo-row" data-completed={Boolean(data.completed)}>
        <Checkbox itemId={data.id} />
        <TextField itemId={data.id} property="title" />
      </div>
    </ItemProvider>
  );
}
