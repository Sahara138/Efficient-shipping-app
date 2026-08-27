export type AnalyticsMetric = {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
};

export type MediaFile = {
  id: string;
  fileName: string;
  fileType: "IMAGE" | "VIDEO" | "GENERIC_FILE";
  url: string;
  sizeMb: number;
  createdAt: string;
};

export type Market = {
  id: string;
  name: string;
  regions: string[];
  currency: string;
  primary: boolean;
  enabled: boolean;
};

export type PaymentGateway = {
  id: string;
  name: string;
  type: "CREDIT_CARD" | "WALLET" | "BUY_NOW_PAY_LATER" | "MANUAL";
  enabled: boolean;
  testMode: boolean;
};
