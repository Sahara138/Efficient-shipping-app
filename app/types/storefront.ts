export type StorefrontCartItem = {
  id: string;
  variantId: string;
  title: string;
  price: string;
  quantity: number;
  image?: string;
};

export type StorefrontCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotalAmount: string;
  currencyCode: string;
  lines: StorefrontCartItem[];
};

export type StorefrontCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  token?: string;
};
