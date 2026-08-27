export type InventoryItem = {
  id: string;
  sku: string;
  productTitle: string;
  variantTitle: string;
  available: number;
  onHand: number;
  committed: number;
  locationName: string;
  updatedAt: string;
};

export type LocationItem = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
  isFulfillmentService: boolean;
};

export type ShippingRateRule = {
  id: string;
  name: string;
  carrier: "DHL" | "FEDEX" | "UPS" | "USPS" | "CUSTOM";
  basePrice: string;
  minWeightKg: number;
  maxWeightKg: number;
  deliveryTimeDays: string;
  isActive: boolean;
};
