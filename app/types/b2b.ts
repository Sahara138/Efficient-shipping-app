export type B2BCompany = {
  id: string;
  name: string;
  externalId?: string;
  customerCount: number;
  locationsCount: number;
  paymentTerms: "NET_30" | "NET_60" | "DUE_ON_RECEIPT";
  catalogName: string;
  createdAt: string;
};

export type B2BLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  companyId: string;
};
