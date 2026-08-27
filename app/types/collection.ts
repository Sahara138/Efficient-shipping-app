export type CollectionRule = {
  column: "TITLE" | "TAG" | "PRICE" | "TYPE" | "VENDOR";
  relation: "EQUALS" | "CONTAINS" | "GREATER_THAN" | "LESS_THAN";
  condition: string;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  handle: string;
  type: "SMART" | "CUSTOM";
  productsCount: number;
  updatedAt: string;
  image?: { url: string; altText?: string };
  rules?: CollectionRule[];
};

export type CollectionFormValues = {
  title: string;
  description: string;
  handle: string;
  type: "SMART" | "CUSTOM";
  imageUrl?: string;
  rules?: CollectionRule[];
};
