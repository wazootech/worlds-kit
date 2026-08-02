import type { ItemTemplateProps } from "../types";

export function SimpleRow({
  data,
  onChange,
  editable = false,
}: ItemTemplateProps & { editable?: boolean }) {
  if (!data) return null;
  return (
    <div className="simple-row">
      {editable ? (
        <input
          value={data.title ?? ""}
          onChange={(event) => void onChange?.({ title: event.target.value })}
        />
      ) : (
        <span>{data.title ?? ""}</span>
      )}
    </div>
  );
}
