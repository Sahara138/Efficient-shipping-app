export type Product = {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string[];
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;

  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
};

export type ProductFormValues = {
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string;
  status: string;
};

export type ProductPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};