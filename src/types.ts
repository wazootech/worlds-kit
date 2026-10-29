import type { ReactElement } from "react";

export type WorldsKitItem = {
  id: string;
  title?: string;
  completed?: boolean;
  orderIndex?: number;
  [key: string]: unknown;
};

export type ItemUpdates = Record<string, unknown>;
export type ItemTemplateProps = {
  data?: WorldsKitItem;
  onChange?: (updates: ItemUpdates) => void;
};
export type DatasetProps = {
  itemId?: string;
  template: ReactElement<ItemTemplateProps>;
  addButton?: ReactElement<{ onClick?: () => void }>;
  isSource?: boolean;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  className?: string;
  emptyState?: ReactElement | string | null;
};

export type WorldsKitSubscription = () => void;
export type WorldsKitBinding = Record<string, unknown>;
export type WorldsKitQueryResult<T = WorldsKitBinding> = {
  results?: T[];
  bindings?: T[];
};

export type WorldsKitDataSourceOptions = {
  signal?: AbortSignal;
  worldId?: string;
};

// Results are parsed transport payloads; narrow them with `queryBindings`
// rather than trusting a caller-chosen type parameter.
export type WorldsKitDataSource = {
  query(sparql: string, options?: WorldsKitDataSourceOptions): Promise<unknown>;
  mutate(
    update: string,
    options?: WorldsKitDataSourceOptions,
  ): Promise<unknown>;
  subscribe?(
    sparql: string,
    onData: (result: unknown) => void,
    onError: (error: Error) => void,
    options?: WorldsKitDataSourceOptions,
  ): WorldsKitSubscription;
};
