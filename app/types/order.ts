export type LineItem = {
  id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
};

export type Order = {
  id: string;
  name: string;
  customerName: string;
  customerEmail: string;
  totalPrice: string;
  currency: string;
  financialStatus: "PAID" | "PENDING" | "REFUNDED" | "AUTHORIZED";
  fulfillmentStatus: "FULFILLED" | "UNFULFILLED" | "PARTIALLY_FULFILLED" | "RESTOCKED";
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
  carrier?: string;
  lineItems: LineItem[];
};

export type DraftOrder = {
  id: string;
  name: string;
  customerName: string;
  customerEmail: string;
  totalPrice: string;
  status: "OPEN" | "COMPLETED" | "INVOICE_SENT";
  createdAt: string;
  lineItems: LineItem[];
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  orderName: string;
  customerName: string;
  reason: "DEFECTIVE" | "WRONG_SIZE" | "NOT_AS_DESCRIBED" | "OTHER";
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  refundAmount: string;
  createdAt: string;
};
