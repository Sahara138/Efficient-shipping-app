export type Discount = {
  id: string;
  code: string;
  title: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y";
  value: string;
  status: "ACTIVE" | "EXPIRED" | "SCHEDULED";
  usageCount: number;
  startsAt: string;
  endsAt?: string;
};

export type GiftCard = {
  id: string;
  codeMasked: string;
  initialValue: string;
  balance: string;
  customerName?: string;
  status: "ACTIVE" | "DISABLED" | "EXPIRED";
  createdAt: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  interval: "WEEKLY" | "MONTHLY" | "YEARLY";
  discountPercentage: number;
  activeSubscribers: number;
  status: "ACTIVE" | "PAUSED";
};
