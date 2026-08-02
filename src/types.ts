import type { ReactElement } from "react";

export type WorldsKitItem = {
  id: string;
  title?: string;
  completed?: boolean;
  orderIndex?: number;
  [key: string]: unknown;
};

export type ItemUpdates = Record<string, unknown>;
export type ItemTemplateProps = { data?: WorldsKitItem; onChange?: (updates: ItemUpdates) => void };
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

export type WorldsSubscription = () => void;
export type WorldsBinding = Record<string, unknown>;
export type WorldsQueryResult<T = WorldsBinding> = {
  results?: T[];
  bindings?: T[];
};

export type WorldsClient = {
  query<T = WorldsQueryResult>(sparql: string, options?: { signal?: AbortSignal }): Promise<T>;
  mutate<T = unknown>(update: string, options?: { signal?: AbortSignal }): Promise<T>;
  subscribe?<T = WorldsQueryResult>(sparql: string, onData: (result: T) => void, onError: (error: Error) => void): WorldsSubscription;
};
