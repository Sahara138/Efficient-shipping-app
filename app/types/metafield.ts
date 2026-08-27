export type MetafieldDefinition = {
  id: string;
  namespace: string;
  key: string;
  name: string;
  ownerType: "PRODUCT" | "VARIANT" | "ORDER" | "CUSTOMER";
  type: "SINGLE_LINE_TEXT" | "JSON" | "INTEGER" | "COLOR" | "FILE_REFERENCE";
  description?: string;
  pinnedCount: number;
};

export type MetaobjectDefinition = {
  id: string;
  type: string;
  name: string;
  fieldCount: number;
  entryCount: number;
  description?: string;
};

export type MetaobjectEntry = {
  id: string;
  handle: string;
  definitionType: string;
  fields: Record<string, any>;
  updatedAt: string;
};
