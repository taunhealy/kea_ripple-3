export enum ContentViewMode {
  EXPLORE = "explore",
  UPLOADED = "uploaded",
  DOWNLOADED = "downloaded",
}

export enum ItemStatus {
  UPLOADED = "uploaded",
  DOWNLOADED = "downloaded",
  PUBLIC = "public",
}

export enum RequestStatus {
  OPEN = "open",
  COMPLETED = "completed",
}

export enum RequestViewMode {
  PUBLIC = "public",
  REQUESTED = "requested",
  ASSISTED = "assisted",
}

export const isContentViewMode = (value: string): value is ContentViewMode => {
  return Object.values(ContentViewMode).includes(value as ContentViewMode);
};

export const isRequestViewMode = (value: string): value is RequestViewMode => {
  return Object.values(RequestViewMode).includes(value as RequestViewMode);
};
