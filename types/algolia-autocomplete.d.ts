declare module "@algolia/autocomplete-plugin-query-suggestions" {
  export function createQuerySuggestionsPlugin(options: any): any;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  authorId: string;
  settings: {
    [key: string]: any;
  };
}

export interface Sample {
  id: string;
  presetId: string;
  name: string;
  description?: string;
  content: string;
  format: "json" | "xml" | "csv" | "text";
  size: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    [key: string]: any;
  };
}
